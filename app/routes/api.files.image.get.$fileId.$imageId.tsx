import { LoaderFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server_dep";
import { auth } from "@/.server/auth/auth";
import s3 from "@/.server/s3.server";
import { folders } from "@/lib/utils";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const authObj = await auth(request);
    if (!authObj) {
      console.log("Unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { fileId, imageId } = params;

    if (!fileId || !imageId) {
      console.log("File ID and image ID are required");
      return Response.json(
        { error: "File ID and image ID are required" },
        { status: 400 },
      );
    }
    const file = await db.file.get(fileId);
    if (!file) {
      console.log("File not found");
      return Response.json({ error: "File not found" }, { status: 404 });
    }
    console.log(imageId);
    const image = await s3.docStoring.get(
      folders.image({
        workspaceId: file.workspaceId,
        jobId: file.jobId,
        fileId: file.fileId,
        imageName: imageId,
      }),
    );

    // Set appropriate headers for JPEG image
    const headers = new Headers({
      "Content-Type": "image/jpeg",
      "Content-Length": image.length.toString(),
      "Cache-Control": "public, max-age=0", // Cache for 1 year
    });

    // Return the buffer directly as the response body
    return new Response(image, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return Response.json(
      { error: "Failed to fetch job status" },
      { status: 500 },
    );
    9;
  }
}
