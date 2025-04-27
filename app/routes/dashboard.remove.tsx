import { ActionFunctionArgs, redirect } from "@remix-run/node";
import db from "@/lib/db.server";
import s3 from "@/lib/s3.server";

export async function action({ request }: ActionFunctionArgs) {
  console.log("action admin remove");
  const formData = await request.formData();
  console.log("MF", formData.entries());

  const action = formData.get("action");
  console.log("action", action);

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
    return redirect("/dashboard");
  }

  // return redirect("/dashboard");
}
