import ai from "@/.server/ai.server";
import { auth } from "@/.server/auth/auth";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request, params }: ActionFunctionArgs) {
  const authorised = await auth(request);
  if (!authorised) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  console.log("body", body);
  const data = await ai.webToText.gemini(
    "Look up the following website and learn about the company. Don't write any personal comment, just straight the name of the company and what it does. The description should be made of 2 sentences that explain the industry the company is in, the company's product and what makes them unique. Don't use any marketing jargon or marketing exaggerations. Answer in JSON format. {name: string, description: string, domain: string} where name is the company name, description is the company description and domain is the domain without https:// and www. When company website is not found, return null. The domain is: " +
      body.domain,
  );

  // console.log("data", data);
  // remove ```json\n and ```
  let clearedContent = data.content.replace("```json\n", "").replace("```", "");
  // remove the citations brackets [1,2,...]
  clearedContent = clearedContent.replace(/\[.*?\]/g, "");
  const json = JSON.parse(clearedContent);
  console.log("json", json);
  return Response.json({ ...json });
}
