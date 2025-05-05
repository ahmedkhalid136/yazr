import yazrServer from "@/.server/yazr.server";
import Overview from "@/components/Overview";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { businessId } = params;
  const company = await yazrServer.business.get(businessId as string);
  const profile = await yazrServer.profile.get(businessId as string);
  console.log("profile", profile);
  return Response.json({ company, profile });
}

export default function CompanyPage() {
  const { company, profile } = useLoaderData<typeof loader>();
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1>Overview</h1>
      <Overview profile={profile} />
    </div>
  );
}
