import db from "@/lib/db.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const signature = params.signature;
  const file = await db.file.queryFromSignature(signature as string);
  return Response.json({ exists: file.length > 0, file: file[0] });
}
