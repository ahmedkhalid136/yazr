import db from "@/lib/db.server_dep";
import s3 from "@/.server/s3.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const jobId = params.jobId;
  if (!jobId) {
    return new Response("Job ID not found", {
      status: 404,
    });
  }
  const job = (await db.job.queryFromJobId(jobId))?.[0];
  if (!job) {
    return new Response("Job not found", {
      status: 404,
    });
  }
  const pdfUrl = job.onePagerUrl;
  if (!pdfUrl) {
    return new Response("PDF key not found", {
      status: 404,
    });
  }
  const pdf = await s3.docStoring.get(pdfUrl);
  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
}
