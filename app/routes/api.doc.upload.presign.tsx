import { ActionFunctionArgs } from "@remix-run/node";
import s3 from "@/.server/s3.server";

export async function action({ request }: ActionFunctionArgs) {
  const { filename, contentType } = await request.json();
  console.log("Presigned filename", filename);
  console.log("contentType", contentType);
  const presignedUrl = await s3.docStoring.getSignedUrl(filename, contentType);
  console.log("Presigned URL", presignedUrl);
  return Response.json(presignedUrl);
}
