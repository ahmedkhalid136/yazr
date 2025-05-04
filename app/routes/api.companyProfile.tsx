import db from "@/lib/db.server_dep";
import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    console.log("id", id);

    const companyProfile = (
      await db.businesses.get({ profileId: id as string }).go()
    ).data;
    console.log("companyProfile", companyProfile);
    if (!companyProfile) {
      return Response.json(null);
    }
    return Response.json(companyProfile);
  } catch (error) {
    return Response.json({ status: "failed" });
  }
};
