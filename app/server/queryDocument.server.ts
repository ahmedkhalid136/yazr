import db from "@/lib/db.server";
import oai from "@/lib/openai.server";

export const queryDocument = async (
  emailId: string,
  prompt: string,
): Promise<string | null> => {
  const email = await db.email.get(emailId);
  console.log("email", email);
  console.log("attachments", email.attachments);
  console.log("subject", email.subject);
  console.log("body", email.body);
  const openAiSettings = email.openAiSettings;
  console.log("openAiSettings", openAiSettings);
  if (!openAiSettings) {
    console.log("No OpenAI settings found");
    return null;
  }

  try {
    const result = await oai.pdfDataExtraction(prompt, openAiSettings);
    console.log("message", result?.message);
    return result?.message ?? null;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
