import yazrServer from "@/.server/yazr.server";
import { auth } from "@/.server/auth/auth";
import { ActionFunctionArgs, json } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const authObj = await auth(request);
  if (!authObj) {
    console.log("Unauthorized, missing authObj");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { workspaceId, userId, subject } = authObj;
  if (!workspaceId || !userId) {
    console.log("Unauthorized, missing workspaceId or userId");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await request.json();
  const domain = data.domain;
  const description = data.description;
  const name = data.name;

  if (!domain || !description || !name) {
    console.log("Domain, description and name are required");
    return Response.json(
      { error: "Domain, description and name are required" },
      { status: 400 },
    );
  }

  try {
    const businessId = await yazrServer.business.create({
      domain: domain as string,
      description: description as string,
      workspaceId: workspaceId,
      userId: userId,
      email: subject.properties.email,
      name: name as string,
    });
    return Response.json({ businessId });
  } catch (error) {
    console.error("Error creating company:", error);
    return Response.json(
      { error: "Failed to create company profile" },
      { status: 500 },
    );
  }
}
