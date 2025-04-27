import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server";
import { auth } from "@/server/auth/auth";
import oai_v2 from "@/lib/openai_v2.server";
import { BulletSchema, CallType } from "@/lib/typesCompany";
import { z } from "zod";

export async function loader({ request, params }: LoaderFunctionArgs) {
  console.log("API CALL Request method", request.method);
  const authObj = await auth(request);

  if (!authObj) {
    console.log("Unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const callId = params.callId;
  console.log("Call ID", callId);
  if (!callId) {
    console.log("Call ID is required");
    return Response.json({ error: "Call ID is required" }, { status: 400 });
  }
  try {
    if (!callId) {
      console.log("Call ID is required");
      return Response.json({ error: "Call ID is required" }, { status: 400 });
    }
    const call = await db.call.get(callId);
    if (!call) {
      console.log("Call not found");
      return Response.json({ error: "Call not found" }, { status: 404 });
    }

    return Response.json(call);
  } catch (error) {
    console.error("Error fetching call:", error);
    return Response.json({ error: "Failed to fetch call" }, { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const authObj = await auth(request);
  if (!authObj) {
    console.log("Unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const callId = params.callId;
  const formData = await request.formData();
  const action = formData.get("action");
  if (!callId) {
    console.log("Call ID is required");
    return Response.json({ error: "Call ID is required" }, { status: 400 });
  }
  if (action === "deleteCall") {
    console.log("Deleting call", callId);
    await db.call.delete(callId);
    return Response.json({ message: "Call deleted" }, { status: 200 });
  }

  if (action === "updateCall") {
    const transcript = formData.get("transcript");
    if (!transcript) {
      console.log("Transcript is required");
      return Response.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }
    console.log("Updating call", callId);
    const formObject = Object.fromEntries(formData.entries());

    const summary = await oai_v2.text.textChat(
      `You are an AI analyst reviewing transcripts of expert calls conducted by YAZR clients (e.g., investors). Your task is to analyze the expert’s perspective on the company being evaluated for investment, not the YAZR client conducting the call.

      Your output must be structured into three sections, each containing no more than 3–4 concise, objective bullet points, written in clear professional language.

      Focus exclusively on the target company under evaluation. Do not summarize or analyze the investor or interviewer (i.e., the YAZR client).

      Analysis focus: ** Summary **
      Briefly describe who the expert is, including their background and relationship to the company being discussed (e.g., investor, client, former employee, competitor, advisor).

      Provide a neutral assessment of the expert’s overall tone — do they appear broadly positive, negative, or mixed on the company?

      Summarize key takeaways gained about the company during the conversation — including product, team, commercial traction, client base, or strategic positioning.
      `,
      `${formObject.transcript}`,
      "gpt-4o-mini",
      z.object({ summary: BulletSchema }),
    );

    const highlights = await oai_v2.text.textChat(
      `You are an AI analyst reviewing transcripts of expert calls conducted by YAZR clients (e.g., investors). Your task is to analyze the expert’s perspective on the company being evaluated for investment, not the YAZR client conducting the call.

Your output must be structured into three sections, each containing no more than 3–4 concise, objective bullet points, written in clear professional language.

Focus exclusively on the target company under evaluation. Do not summarize or analyze the investor or interviewer (i.e., the YAZR client).


Analysis focus: ** Highlights **

List 3–4 positives or strengths about the company, as expressed by the expert. These may include:

Product strengths or technical edge

Traction with customers or strong go-to-market execution

Management quality or relevant industry experience

Size of the market opportunity or favorable competitive dynamics

Keep tone objective and insightful — avoid repeating hype or promotional language used by the expert. Your goal is to surface substantive reasons why this company might be a compelling investment.`,
      `${formObject.transcript}`,
      "gpt-4o-mini",
      z.object({ highlights: BulletSchema }),
    );

    const challenges = await oai_v2.text.textChat(
      ` You are an AI analyst reviewing transcripts of expert calls conducted by investment professionals. Your task is to extract objective and insightful investment intelligence from the transcript in a structured format, suitable for internal decision-making.

For each transcript, produce a **three-part summary** written in clear, concise, and professional language. **Each section should contain no more than 3–4 bullet points**. Write in an objective tone — avoid echoing the expert’s enthusiasm or skepticism without qualification. Be fair, but not promotional.

Analysis focus: ** Lowlights **

List 3–4 negatives, risks, or challenges the expert highlighted. These may include:

Product weaknesses or maturity concerns

Execution issues (e.g., hiring, delivery, scaling)

Long sales cycles or poor economics

Competitive threats or unclear differentiation

Past implementation or client satisfaction issues

Note if a concern is anecdotal or speculative, but still capture it fairly. Be critical but balanced — your tone should reflect investor-level scrutiny, not editorial opinion.`,
      `${formObject.transcript}`,
      "gpt-4o-mini",
      z.object({ challenges: BulletSchema }),
    );

    console.log("summary", summary);

    const newCall: CallType = {
      callId,
      businessId: formObject.businessId as string,
      date: formObject.date as string,
      companyParticipants: Array.isArray(formObject.companyParticipants)
        ? (formObject.companyParticipants as string[])
        : [formObject.companyParticipants as string],
      externalParticipant: formObject.externalParticipant as string,
      externalParticipantCompany:
        formObject.externalParticipantCompany as string,
      externalParticipantPosition:
        formObject.externalParticipantPosition as string,
      externalParticipantRelationship: Array.isArray(
        formObject.externalParticipantRelationship,
      )
        ? (formObject.externalParticipantRelationship as string[])
        : [formObject.externalParticipantRelationship as string],
      transcript: formObject.transcript as string,
      summary: JSON.parse(summary as string).summary,
      highlights: JSON.parse(highlights as string).highlights,
      challenges: JSON.parse(challenges as string).challenges,
    };

    console.log("newCall", newCall);

    await db.call.create({ ...newCall });

    return Response.json(newCall, { status: 200 });
  }
  return Response.json({ error: "Invalid request method" }, { status: 405 });
}
