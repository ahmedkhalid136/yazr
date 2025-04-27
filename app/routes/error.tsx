import { LoaderFunctionArgs } from "@remix-run/node";

export function loader({}: LoaderFunctionArgs) {
  return Response.json({
    description: "This is a great ocmnpany",
  });
}
