import { LoaderFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server";
import { auth } from "@/server/auth/auth";
import s3 from "@/lib/s3.server";
import { folders } from "@/lib/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const authObj = await auth(request);
    if (!authObj) {
      console.log("Unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, mdName } = params;
    if (!fileId || !mdName) {
      console.log("File ID and markdown name are required");
      return Response.json(
        { error: "File ID and markdown name are required" },
        { status: 400 },
      );
    }

    const file = await db.file.get(fileId);
    if (!file) {
      console.log("File not found");
      return Response.json({ error: "File not found" }, { status: 404 });
    }

    const markdown = await s3.docStoring.get(
      folders.markdownImage({
        workspaceId: file.workspaceId,
        jobId: file.jobId,
        fileId: file.fileId,
        imageName: mdName,
      }),
    );

    const markdownString = JSON.parse(markdown.toString()).markdown;

    return Response.json(markdownString || "Error");
  } catch (error) {
    console.error("Error fetching job:", error);
    return Response.json("error");
  }
}
