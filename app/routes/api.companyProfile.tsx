import db from "@/lib/db.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    console.log("id", id);

    const companyProfile = await db.companyProfile.get(id as string);
    console.log("companyProfile", companyProfile);
    if (!companyProfile) {
      return json(null);
    }
    return json(companyProfile);
  } catch (error) {
    return json({ status: "failed" });
  }
};
