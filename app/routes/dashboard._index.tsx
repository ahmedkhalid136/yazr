import DocTile from "@/components/DocTile";
import db from "@/lib/db.server";
import { auth } from "@/server/auth/auth";
import {
  redirect,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import ModalDomain from "@/components/ModalDomain";
import { JobType } from "@/lib/types";

import { useEffect } from "react";
import s3 from "@/lib/s3.server";

export default function Dashboard() {
  const { companies } = useLoaderData<typeof loader>();

  return (
    <div className="justify-start items-center w-full h-full p-6 flex flex-col gap-6 md:min-w-[800px] md:max-w-[1024px]">
      <div className="flex justify-between items-center w-full pt-12">
        <h1 className="text-4xl font-bold items-end ">
          {(() => {
            const hour = new Date().getHours();
            const greeting =
              hour < 12
                ? "Good morning"
                : hour < 18
                  ? "Good afternoon"
                  : "Good evening";
            return `${greeting},`;
          })()}
        </h1>
        <ModalDomain companies={companies} />
      </div>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const authorised = await auth(request);
  const queryParams = new URL(request.url).searchParams;
  let userProfile = undefined;

  console.log("authorised", authorised);

  if (!authorised?.userId || !authorised?.workspaceId) {
    console.log("redirecting to onboard from dashboard?");
    return redirect("/login");
  }

  console.log("iauthorised userId", authorised?.userId);
  const jobs = await db.job.getLatest(authorised?.workspaceId, 10);
  console.log("jobs in the dashboard", jobs.length);
  const companies = await db.businesses.getAll(authorised?.workspaceId);
  console.log("companies in the dashboard", companies.length);
  return {
    jobs: jobs || [],
    userProfile: userProfile || null,
    companies: companies || [],
  };
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("action in the dashboard _index");
  try {
    const formData = await request.formData();
    const action = formData.get("action");
    console.log("Action", action);

    if (action === "remove") {
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
    return { success: false, error: "Invalid action" };
  } catch (error) {
    console.error("Action error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
