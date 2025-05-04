import db from "@/lib/db.server";
import s3 from "@/.server/s3.server";
import { folders } from "@/lib/utils";
import { onePagerPPT } from "@/.server/utils/onePagerPPT";
import { ActionFunctionArgs } from "@remix-run/node";

export async function loader({ params }: ActionFunctionArgs) {
  const { profileId } = params;
  const profile = await db.businesses.get(profileId as string);
  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  console.log("profile", profile);
  console.log("profileId for pptx", profileId);
  const onePagerStreamPPT = await onePagerPPT(profile);

  const onePagerKey = folders.onePager({
    workspaceId: profile.workspaceId,
    jobId: profile.profileId,
  });

  // console.log("onePagerKey", onePagerKey);
  console.log("onePagerStreamPPT size", onePagerStreamPPT);

  // await s3.docStoring.upload(
  //   onePagerStreamPPT,
  //   onePagerKey,
  //   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // );

  // // Concatenate all chunks into a single Uint8Array
  // let chunks: Uint8Array[] = [];
  // for await (const chunk of onePagerStreamPPT) {
  //   chunks.push(chunk);
  // }
  // const fullBuffer = Buffer.concat(chunks);
  // console.log("fullBuffer size", fullBuffer.length);
  return new Response(onePagerStreamPPT, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    },
  });
}
