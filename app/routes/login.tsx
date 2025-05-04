import { login } from "@/.server/auth/auth";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  return await login(request);
}
