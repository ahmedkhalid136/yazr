import db from "@/lib/db.server";
import { JobStatus } from "@/lib/types";
import { LoaderFunctionArgs, json } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  console.log("job email id", id);
  const job = await db.job.queryFromEmailId(id as string);
  if (job?.[0]?.status === JobStatus.FAILED) {
    return json({ status: "failed" });
  }
  if (!job?.[0]?.rawData) {
    return json({ status: "processing..." });
  }
  return json(job?.[0]?.rawData);
};
