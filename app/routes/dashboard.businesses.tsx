import { BusinessProfile } from "@/lib/typesCompany";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/.server/auth/auth";
import { Button } from "@/components/ui/button";
import yazrServer from "@/.server/yazr.server";
import { CreateBusinessPayload } from "@/.server/electroDb.server";
export default function Companies() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const handleClick = (profileId: string) => {
    navigate(`/dashboard/business/${profileId}`);
    // console.log(`/dashboard/business/${profileId}`);
  };
  return (
    <div className="justify-start w-full h-full p-6 flex flex-col gap-6 md:min-w-[800px] md:max-w-[1024px]">
      <h1 className="text-4xl font-bold items-end pt-12">Companies</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Country</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data &&
            data.companies.map((company: CreateBusinessPayload) => (
              <TableRow
                key={company.businessId}
                onClick={() => handleClick(company.businessId)}
                className="w-full hover:cursor-pointer"
              >
                <TableCell className="font-medium  hover:underline">
                  {company.domain}
                </TableCell>
                <TableCell className="">
                  {company.companyProfile?.basicInfo?.industry?.primarySector ||
                    "..."}
                </TableCell>
                <TableCell className="">
                  {company.companyProfile?.basicInfo?.stage || "..."}
                </TableCell>
                <TableCell className="text-right ">
                  {company.companyProfile?.basicInfo?.headquarters?.country ||
                    "..."}
                </TableCell>
                <TableCell className="text-right flex gap-2 justify-end">
                  <Form method="post" className="flex gap-2">
                    <Button
                      variant="outline"
                      name="action"
                      value="delete"
                      type="submit"
                    >
                      Delete
                    </Button>
                    <input
                      type="hidden"
                      name="businessId"
                      value={company.businessId}
                    />
                  </Form>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const authObj = await auth(request);
  if (authObj) {
    const { workspaceId } = authObj;
    if (!workspaceId) {
      return Response.json({ companies: [] });
    }
    const companies = await yazrServer.business.getAll(workspaceId);
    // console.log("companies", companies);
    return Response.json({ companies });
  }
  return Response.json({ companies: [] });
}

export async function action({ request }: ActionFunctionArgs) {
  const authObj = await auth(request);
  if (authObj) {
    const { workspaceId } = authObj;
  }
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  if (data.action === "delete") {
    const { businessId } = data;
    await yazrServer.business.delete(businessId as string);
  }
  return redirect("/dashboard/businesses");
}
