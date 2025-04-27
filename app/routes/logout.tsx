import { logout } from "@/server/auth/auth";
import { LoaderFunctionArgs } from "@remix-run/node";
export default function Logout() {
  return <div>Logout</div>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  return await logout();
}
