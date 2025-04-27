import db from "@/lib/db.server";
import { JobFileType, JobStatus } from "@/lib/types";
import yazrServer from "@/lib/yazr.server";
import { ActionFunctionArgs } from "@remix-run/node";

export async function loader({ request, params }: ActionFunctionArgs) {
  const jobId = params.jobId;
  if (!jobId) {
    return new Response("Job ID is required", { status: 400 });
  }
  const files = await db.file.queryFromJobId(jobId);
  if (!files) {
    return new Response("Job not found", { status: 404 });
  }
  const user = await db.user.get(files[0].userId);
  if (!user) {
    return new Response("User not found", { status: 404 });
  }
  const job = await yazrServer.job.createFromUpload({
    jobId: jobId,
    fileUrls: files.map((file) => file.fileUrl as string),
    email: user.email,
    name: user.name,
    surname: user.surname,
    businessProfileId: files[0].businessId,
    userId: files[0].userId,
    workspaceId: user.workspaceId,
    fileStatus: files.map((file) => ({
      fileId: file.fileId,
      fileUrl: file.fileUrl,
      status: file.status,
    })),
  });

  // await yazrServer.job.sendToQueue(job.createdAt, user.workspaceId);

  return new Response("Job started", { status: 200 });
}
