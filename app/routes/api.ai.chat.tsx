import db from "@/.server/electroDb.server";
import oai from "@/.server/openai.server";

import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  if (!message) {
    return Response.json({ answer: "Message is required" });
  }
  const jobId = formData.get("jobId") as string;
  console.log("jobId", jobId);
  if (!jobId || jobId === "") {
    return Response.json({ answer: "Job ID is required" });
  }
  const job = await db.job.queryFromJobId(jobId);
  if (!job) {
    return Response.json({ answer: "Job not found" });
  }
  const oaiSettings = job[0].ai?.openAiSettings;

  if (!oaiSettings) {
    return Response.json({ answer: "Yazr is not yet ready" });
  }

  const response = await oai.pdfDataExtraction(message, {
    threadId: oaiSettings.threadId,
    assistantId: oaiSettings.assistantId,
  });
  console.log("response", response?.message);
  if (response?.message) {
    return Response.json({ answer: response?.message });
  }
  return Response.json({ answer: "Something went wrong" });
}
