import { LoaderFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server";
import { auth } from "@/.server/auth/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const authObj = await auth(request);
    if (!authObj) {
      console.log("Unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.jobId;
    if (!jobId) {
      console.log("Job ID is required");
      return Response.json({ error: "Job ID is required" }, { status: 400 });
    }

    const job = await db.job.queryFromJobId(jobId);
    if (!job) {
      console.log("Job not found");
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    return Response.json(job[0]);
  } catch (error) {
    console.error("Error fetching job:", error);
    return Response.json(
      { error: "Failed to fetch job status" },
      { status: 500 },
    );
  }
}
