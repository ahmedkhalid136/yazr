import db from "@/lib/db.server_dep";
import oai from "@/lib/openai.server";

export const queryCompany = async (
  emailId: string,
  prompt: string,
): Promise<string | null> => {
  const email = await db.email.get(emailId);
  console.log("email", email);
  console.log("attachments", email.attachments);
  console.log("subject", email.subject);
  console.log("body", email.body);
  const companyProfile = await db.businesses.get(emailId);
  try {
    const result = await oai.textChat(prompt, JSON.stringify(companyProfile));
    console.log("message", result);
    return result ?? null;
  } catch (error) {
    console.error("Error extracting data from PDF", error);
  }

  return null;
};
