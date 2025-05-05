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
import { Field } from "@/lib/types";
import { useState } from "react";
import { TextEdit } from "@/components/ui/textEdit";
export default function Template() {
  const { template } = useLoaderData<typeof loader>();
  const [fields, setFields] = useState<Field[]>(template.fields);

  const handleAddField = () => {
    const newField: Field = {
      title: "",
      category: "other",
      prompt: "",
      value: "",
      proposeChange: "",
      editedAt: "",
      source: "",
      approvedBy: "",
    };
    setFields([...fields, newField]);
  };

  return (
    <div className="justify-start w-full h-full p-6 flex flex-col gap-6 md:min-w-[800px] md:max-w-[1024px]">
      <h1 className="text-4xl font-bold items-end pt-12">Schema Template</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Prompt</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {template.fields &&
            template.fields.map((field: Field) => (
              <TableRow
                key={field.title}
                className="w-full hover:cursor-pointer"
              >
                <TableCell className="font-medium  ">
                  <TextEdit
                    name="title"
                    defaultValue={field.title}
                    actionName={`updateTitle-${field.id}`}
                    isHideAI={true}
                  />
                </TableCell>
                <TableCell className="">
                  <TextEdit
                    name="category"
                    defaultValue={field.category}
                    actionName={`updateCategory-${field.id}`}
                    isHideAI={true}
                  />
                </TableCell>
                <TableCell className="">
                  <TextEdit
                    name="prompt"
                    defaultValue={field.prompt}
                    actionName={`updatePrompt-${field.id}`}
                    isHideAI={true}
                  />
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
                    <Button
                      variant="outline"
                      name="action"
                      value="save"
                      type="submit"
                    >
                      Save
                    </Button>
                    <input
                      type="hidden"
                      name="templateId"
                      value={template.templateId}
                    />
                    <input type="hidden" name="title" value={field.title} />
                    <input
                      type="hidden"
                      name="category"
                      value={field.category}
                    />
                    <input
                      type="hidden"
                      name="workspaceId"
                      value={template.workspaceId}
                    />
                  </Form>
                  <Button
                    variant="outline"
                    name="action"
                    value="add"
                    type="button"
                    onClick={handleAddField}
                  >
                    Add
                  </Button>
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
  if (!authObj) {
    return Response.json({ template: null });
  }
  const { workspaceId } = authObj;
  if (!workspaceId) {
    return Response.json({ template: null });
  }
  const template = await yazrServer.template.get({ workspaceId });
  return Response.json({ template });
}

export async function action({ request }: ActionFunctionArgs) {
  const authObj = await auth(request);
  if (authObj) {
    const { workspaceId } = authObj;
  }
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  const action = data.action as string;
  console.log(data);
  if (!action) {
    return redirect("/dashboard/template");
  }
  if (action.startsWith("delete")) {
    const id = action.split("-")[1];
    await yazrServer.template.delete(id as string);
  }
  return redirect("/dashboard/template");
}
