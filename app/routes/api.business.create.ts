import crustdata from "@/lib/crustdata.server";
import yazrServer from "@/lib/yazr.server";
import { auth } from "@/server/auth/auth";
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

  if (!domain || !description) {
    console.log("Domain and description are required");
    return Response.json(
      { error: "Domain and description are required" },
      { status: 400 },
    );
  }

  try {
    // Get company data from Crustdata API
    console.log("Getting company data from Crustdata API");
    const companyData = await crustdata.byDomainSafe(domain as string);

    if (!companyData) {
      console.log("Company not found");
      const profileId = await yazrServer.business.createDraft({
        domain: domain as string,
        description: description as string,
        workspaceId: workspaceId,
        userId: userId,
        email: subject.properties.email,
        companyName: domain as string,
      });
      return Response.json({ profileId });
    }
    console.log("Creating company profile with Crustdata");
    const foundersData = await crustdata.byDomainFoundersSafe(domain as string);
    console.log("Founders data");
    // Pass the Crustdata directly to createDraft
    const profileId = await yazrServer.business.createDraft({
      domain: companyData.company_website_domain as string,
      description: description as string,
      workspaceId: workspaceId,
      userId: userId,
      email: subject.properties.email,
      companyName: companyData.company_name || "",
      linkedin: companyData.linkedin_profile_url || "",
      primarySector: Array.isArray(companyData.taxonomy.linkedin_industries)
        ? companyData.taxonomy.linkedin_industries.join(", ")
        : JSON.stringify(companyData.taxonomy.linkedin_industries),
      subSector: Array.isArray(companyData.taxonomy.crunchbase_categories)
        ? companyData.taxonomy.crunchbase_categories.join(", ")
        : JSON.stringify(companyData.taxonomy.crunchbase_categories),
      city: companyData.headquarters?.split(",")[0]?.trim() || "",
      country: companyData.hq_country || "",
      crustData: companyData,
      foundersData: foundersData || undefined,
    });

    console.log("businessId", profileId);

    return Response.json({ profileId });
  } catch (error) {
    console.error("Error creating company:", error);
    return Response.json(
      { error: "Failed to create company profile" },
      { status: 500 },
    );
  }
}
