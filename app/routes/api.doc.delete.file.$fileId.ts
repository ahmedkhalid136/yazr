import db from "@/lib/db.server";
import s3 from "@/.server/s3.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { fileId } = params;
  if (!fileId)
    return Response.json(
      { ok: false, error: "File ID is required" },
      { status: 400 },
    );
  const file = await db.file.get(fileId);
  if (!file)
    return Response.json(
      { ok: false, error: "File not found" },
      { status: 404 },
    );
  await db.file.delete(fileId);
  await s3.docStoring.delete(file.fileUrl);
  return Response.json({
    ok: true,
  });
}
