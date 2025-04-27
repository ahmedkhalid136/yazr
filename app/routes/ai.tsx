import ant from "@/lib/anthropic.server";
import gemini from "@/lib/gemini.server";
import oai from "@/lib/openai.server";
import { ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const url = formData.get("url") as string;
  const model = formData.get("model");
  console.log("model", model);
  console.log("url", url);
  if (model === "oai") {
    const markdown = await oAIMarkDown(url);
    return Response.json({ markdown: JSON.stringify(markdown) });
  }
  if (model === "gemini") {
    const markdown = await geminiMarkDown(url);
    return Response.json({ markdown: JSON.stringify(markdown) });
  }
  if (model === "claud") {
    const markdown = await claudMarkDown(url);
    return Response.json({ markdown: JSON.stringify(markdown) });
  }

  return Response.json({ error: "Invalid model" });
}

const system = `Convert the following PDF page to markdown.
Return only the markdown with no explanation text. Do not include deliminators like '''markdown.
You must include all information on the page. Do not exclude headers, footers, or subtext.`;

const oAIMarkDown = async (imgUrl: string) => {
  const user = "Here is the image: ";
  const markdown = await oai.imageUrlChat(system, user, imgUrl);
  return markdown;
};

const geminiMarkDown = async (imgUrl: string) => {
  const user = "Here is the image: ";
  const markdown = await gemini.imageUrlChat(user, [imgUrl], system);
  return markdown;
};

const claudMarkDown = async (imgUrl: string) => {
  try {
    const file = await (
      await fetch(imgUrl).then((res) => res.blob())
    ).arrayBuffer();

    const user = "Here is the image: ";
    const markdown = await ant.imageChat(user, system, file);
    return markdown;
  } catch (e) {
    console.log(e);
    return "error";
  }
};
