import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { User, Workspace } from "@/lib/types";
import yazrServer from "@/lib/yazr.server";
import { auth, setTokens, updateWorkspaceHeaders } from "@/server/auth/auth";
import { client } from "@/server/auth/authClient";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request }: LoaderFunctionArgs) {
  const authorised = await auth(request);
  if (!authorised) {
    return redirect("/login");
  }
  const email = authorised?.subject?.properties.email;
  if (!email) {
    return redirect("/login");
  }
  const user = await yazrServer.user.getByEmail({ email });
  //   if (user.workspaceId !== "temp") {
  //     return redirect("/dashboard");
  //   }
  return Response.json({ email });
}

export default function Onboard() {
  const { email } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-200">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle>Onboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="flex flex-col gap-4 ">
            <Input type="name" name="name" placeholder="Name" required />
            <Input type="email" name="email" disabled defaultValue={email} />
            <Input
              type="text"
              name="company"
              disabled
              defaultValue={"Blackfin"}
            />
            <Button type="submit">Submit</Button>
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="company" value={"Blackfin"} />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");
  const company = formData.get("company");

  console.log("name", name);
  console.log("email", email);
  console.log("company", company);

  const workspaceId = `WORKSPACE#${company}`;
  const workspace: Workspace = {
    PK: workspaceId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    constIndex: "constIndex",
    name: company as string,
  };
  await yazrServer.workspace.create(workspace);
  const user: User = {
    PK: `USER#${email}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    email: email as string,
    name: name as string,
    surname: "",
    constIndex: "constIndex",
    companyName: company as string,
    profileImageUrl: "",
    roles: ["user"],
    workspaceId: workspaceId,
  };
  await yazrServer.user.create(user);

  return redirect("/dashboard");
}
