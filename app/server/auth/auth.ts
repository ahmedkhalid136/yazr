import { createCookie, redirect } from "@remix-run/node";
import { Subject, subjects } from "../../../backend/auth/subjects";
import { client } from "./authClient";
import { users } from "@/lib/electroDb.server";

const accessTokenCookie = createCookie("access_token", {
  httpOnly: true,
  sameSite: "lax",

  path: "/",
  maxAge: 34560000,
});

const refreshTokenCookie = createCookie("refresh_token", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 34560000,
});

const userIdCookie = createCookie("user_id", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 34560000,
});

const workspaceIdCookie = createCookie("workspace_id", {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  maxAge: 34560000,
});

export async function setTokens(
  request: Request,
  access: string,
  refresh: string,
  userId?: string,
  workspaceId?: string,
) {
  const headers = new Headers();

  headers.append("Set-Cookie", await accessTokenCookie.serialize(access));
  headers.append("Set-Cookie", await refreshTokenCookie.serialize(refresh));
  if (userId) {
    headers.append("Set-Cookie", await userIdCookie.serialize(userId));
  }
  if (workspaceId) {
    headers.append(
      "Set-Cookie",
      await workspaceIdCookie.serialize(workspaceId),
    );
  }

  return headers;
}

export async function auth(request: Request): Promise<{
  subject: Subject;
  userId?: string;
  workspaceId?: string;
  headers: Headers;
} | null> {
  const accessToken = await accessTokenCookie.parse(
    request.headers.get("Cookie"),
  );
  const refreshToken = await refreshTokenCookie.parse(
    request.headers.get("Cookie"),
  );

  if (!accessToken) {
    return null;
  }

  try {
    const verified = await client.verify(subjects, accessToken, {
      refresh: refreshToken || undefined,
    });

    if (verified.err) {
      console.error("Verification error:", verified.err);
      return null;
    }

    const { userId, workspaceId } = await checkIds(
      request,
      verified.subject.properties.email,
    );

    const headers = await setTokens(
      request,
      accessToken,
      refreshToken,
      userId,
      workspaceId,
    );
    return { subject: verified.subject, userId, workspaceId, headers };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

export async function login(request: Request) {
  // const accessToken = await accessTokenCookie.parse(
  //   request.headers.get("Cookie"),
  // );
  // const refreshToken = await refreshTokenCookie.parse(
  //   request.headers.get("Cookie"),
  // );

  // if (accessToken) {
  //   const verified = await client.verify(subjects, accessToken, {
  //     refresh: refreshToken,
  //   });
  //   if (!verified.err && verified.tokens) {
  //     const headers = await setTokens(
  //       request,
  //       verified.tokens.access,
  //       verified.tokens.refresh,
  //       "",
  //       "",
  //     );
  //     return redirect("/", { headers });
  //   }
  // }

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    await accessTokenCookie.serialize("", { maxAge: 0 }),
  );
  headers.append(
    "Set-Cookie",
    await refreshTokenCookie.serialize("", { maxAge: 0 }),
  );

  headers.append("Set-Cookie", await userIdCookie.serialize("", { maxAge: 0 }));
  headers.append(
    "Set-Cookie",
    await workspaceIdCookie.serialize("", { maxAge: 0 }),
  );

  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  console.log("authorizing", `${protocol}://${host}/api/auth/callback`);
  const { url } = await client.authorize(
    `${protocol}://${host}/api/auth/callback`,
    "code",
  );
  return redirect(url);
}

export async function logout() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    await accessTokenCookie.serialize("", { maxAge: 0 }),
  );
  headers.append(
    "Set-Cookie",
    await refreshTokenCookie.serialize("", { maxAge: 0 }),
  );

  headers.append("Set-Cookie", await userIdCookie.serialize("", { maxAge: 0 }));
  headers.append(
    "Set-Cookie",
    await workspaceIdCookie.serialize("", { maxAge: 0 }),
  );

  return redirect("/", { headers });
}

const checkIds = async (
  request: Request,
  email: string,
): Promise<{ userId: string; workspaceId: string }> => {
  let userId = await userIdCookie.parse(request.headers.get("Cookie"));
  let workspaceId = await workspaceIdCookie.parse(
    request.headers.get("Cookie"),
  );
  if (!userId) {
    console.log("no userId, gotta add it to the headers");
    const user = await users.query.byEmail({ email }).go();
    console.log("checking user", user);
    userId = user.data[0]?.PK;
  }
  if (!workspaceId) {
    console.log("no workspaceId, gotta add it to the headers");
    const user = await users.query.byEmail({ email }).go();
    console.log("checking workspace", user.data[0]?.workspaceId);
    workspaceId = user.data[0]?.workspaceId;
  }
  return { userId, workspaceId };
};
