import { client } from "@/.server/auth/authClient";
import { setTokens } from "@/.server/auth/auth";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  const host = request.headers.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const callbackUrl = `${protocol}://${host}/api/auth/callback`;

  const tokens = await client.exchange(code, callbackUrl);

  if (tokens.err) {
    return new Response(JSON.stringify(tokens.err), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const headers = await setTokens(
    request,
    tokens.tokens.access,
    tokens.tokens.refresh,
  );

  return redirect("/dashboard?redirect=true", { headers });
}
