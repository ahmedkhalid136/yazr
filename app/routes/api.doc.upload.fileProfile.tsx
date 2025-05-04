import { ActionFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server_dep";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.json();
  const jobId = formData.jobId;
  const workspaceId = formData.workspaceId;
  if (!workspaceId || !jobId) {
    return new Response("Workspace ID and Job ID are required", {
      status: 400,
    });
  }
  const result = await db.file.create(formData);

  return Response.json({ result });
}
