import ai from "@/.server/ai.server";
import { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const query = new URL(request.url).searchParams.get("domain");
  const data = await ai.webToText.gemini(
    "Look up on the web the company at this address: " +
      query +
      "\n Write me a description of what the company does. Don't write any personal comment, just straight the name of the cmopany and what it does.",
  );
  return Response.json({ ...data });
}
