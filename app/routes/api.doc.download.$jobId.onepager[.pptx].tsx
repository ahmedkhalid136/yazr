import db from "@/lib/db.server_dep";
import s3 from "@/.server/s3.server";
import { folders } from "@/lib/utils";
import { onePagerPPT } from "@/lib/onePagerPPT";
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
  // const pdfUrl = job.onePagerUrl;
  const folder = `${job.workspaceId}/${job.jobId}`;
  // const pptxUrl = `${folder}/onepager.pptx`;
  // if (!pptxUrl) {
  //   return new Response("PDF key not found", {
  //     status: 404,
  //   });
  // }
  // const pdf = await s3.docStoring.get(pptxUrl);

  const parsedCompanyData = await s3.docStoring.get(
    folders.companyProfile({
      workspaceId: job.workspaceId,
      jobId: job.jobId,
    }),
  );

  const webEnhancement = await s3.docStoring.get(
    folders.webEnhancement({
      workspaceId: job.workspaceId,
      jobId: job.jobId,
    }),
  );
  const parsedWebEnhancement = JSON.parse(webEnhancement.toString());

  const pptx = await onePagerPPT(
    jobId,
    JSON.parse(parsedCompanyData.toString()),
    parsedWebEnhancement,
  );

  // Concatenate all chunks into a single Uint8Array
  let chunks: Uint8Array[] = [];
  for await (const chunk of pptx) {
    chunks.push(chunk);
  }
  const fullBuffer = Buffer.concat(chunks);

  return new Response(fullBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
  });
}
