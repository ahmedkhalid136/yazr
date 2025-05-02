// import {
//   useActionData,
//   Outlet,
//   useNavigate,
//   useLocation,
//   useLoaderData,
// } from "@remix-run/react";
// import { SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/AppSidebar";
// import { useUser } from "@/providers/userProvider";
// import { useEffect, useRef } from "react";
// import { User } from "@/lib/types";
// import {
//   ActionFunctionArgs,
//   LoaderFunctionArgs,
//   redirect,
// } from "@remix-run/node";
// import { users } from "@/lib/electroDb";
// import s3 from "@/lib/s3";
// import { auth } from "@/server/auth/auth";
// import db from "@/lib/db";

import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import {
  Outlet,
  redirect,
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { users } from "@/lib/electroDb.server";
import s3 from "@/lib/s3.server";
import db from "@/lib/db.server";
import { auth } from "@/server/auth/auth";
import { useRef } from "react";
import { User } from "@/lib/types";

export default function Dashboard() {
  return (
    <>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "20rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={null} />
        <main>
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("action admin??");
  const formData = await request.formData();
  console.log("MF", formData.entries());
  const action = formData.get("name");

  console.log("action", action);
  if (action === "getUser") {
    console.log("getting user");
    const userId = formData.get("userId");
    console.log("userId", userId);
    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }
    console.log("getting user profile", { PK: userId });
    const userProfile = await users.get({ PK: userId as string }).go();
    console.log("userProfile", userProfile);
    if (!userProfile.data) {
      console.log("redirecting to onboard from dashboard");
      // return redirect("/onboard");
    }
    // return Response.json({ user: userProfile.data });
  }
  const isAction = formData.get("name");
  const type = formData.get("value");
  console.log("isAction", isAction);
  console.log("type", type);
  if (isAction === "action" && type === "remove") {
    console.log("Removing job");
    const workspaceId = formData.get("workspaceId");
    const createdAt = formData.get("createdAt");
    const fileUrlsStr = formData.get("fileUrls");

    if (!workspaceId || !createdAt) {
      throw new Error("Missing required fields");
    }

    let fileUrls: string[] = [];
    if (typeof fileUrlsStr === "string") {
      try {
        fileUrls = JSON.parse(fileUrlsStr);
      } catch {
        fileUrls = [fileUrlsStr];
      }
    }

    console.log("Processed fileUrls:", fileUrls);
    console.log("Workspace ID", workspaceId);

    for (const fileUrl of fileUrls) {
      try {
        await s3.docStoring.delete(fileUrl);
      } catch (error) {
        console.error(`Failed to delete file ${fileUrl}:`, error);
      }
    }

    await db.job.delete(workspaceId.toString(), createdAt.toString());
    return { success: true };
  }
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const authorised = await auth(request);
  // console.log("dauthorised userId", authorised?.userId);
  // console.log("dauthorised workspaceId", authorised?.workspaceId);
  return Response.json({ authorised });
}
