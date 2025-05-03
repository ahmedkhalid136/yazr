import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request, params }: LoaderFunctionArgs) {
  return null;
}

export default function CompanyPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1>Overview</h1>
    </div>
  );
}
