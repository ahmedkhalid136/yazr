import { ActionFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server";
import { auth } from "@/.server/auth/auth";
import { redirect } from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";
import { CallType, CallSchema, BulletSchema } from "../lib/typesCompany";
import { z } from "zod";
import ai from "@/lib/ai.server";
import oai_v2 from "@/lib/openai_v2.server";

export async function action({ request }: ActionFunctionArgs) {
  console.log("makign new call action running");
  const authObj = await auth(request);
  if (!authObj) {
    return redirect("/login");
  }
  const formData = await request.formData();
  const formObject = Object.fromEntries(formData.entries());
  const action = formObject.action as string;
  if (action === "createSummary") {
    const callsIds = JSON.parse(formObject.calls as string);

    const calls = [];
    console.log("callsIds", callsIds);
    for (const callId of callsIds) {
      const call = await db.call.get(callId.value as string);
      calls.push(call);
    }
    console.log("calls", calls);

    const summary = await oai_v2.text.textChat(
      "Extract the main takeways from the list of takeways in the following bullet points. Summarize them.",
      `${calls.map((call) => call?.summary?.join("\n")).join("\n")}`,
      "gpt-4o-mini",
      z.object({ summary: BulletSchema }),
    );

    const highlights = await oai_v2.text.textChat(
      "List the maint positive aspects in this list of highlights. Summarize them.",
      `${calls.map((call) => call?.summary?.join("\n")).join("\n")}`,
      "gpt-4o-mini",
      z.object({ highlights: BulletSchema }),
    );

    const challenges = await oai_v2.text.textChat(
      "List the main challenges or negative aspects in this list of challenges. Summarize them.",
      `${calls.map((call) => call?.summary?.join("\n")).join("\n")}`,
      "gpt-4o-mini",
      z.object({ challenges: BulletSchema }),
    );

    let profile = await db.businesses.get(formObject.profileId as string);
    if (!profile) {
      console.log("Profile not found");
      return Response.json({ error: "Profile not found" }, { status: 404 });
    }
    if (profile) {
      profile.calls = {
        overallSummary: JSON.parse(summary as string).summary,
        overallHighlights: JSON.parse(highlights as string).highlights,
        overallChallenges: JSON.parse(challenges as string).challenges,
      };
    }

    await db.businesses.create(profile);

    return null;
  }

  if (action === "createCall") {
    console.log("createCall", formObject);

    const transcript = formObject.transcript as string;
    if (!transcript) {
      console.log("Transcript is required");
      return Response.json(
        { error: "Transcript is required" },
        { status: 400 },
      );
    }
    const summary = await oai_v2.text.textChat(
      `You are an AI analyst reviewing transcripts of expert calls conducted by investment professionals. Your task is to extract objective and insightful investment intelligence from the transcript in a structured format, suitable for internal decision-making.

For each transcript, produce a **three-part summary** written in clear, concise, and professional language. **Each section should contain no more than 3–4 bullet points**. Write in an objective tone — avoid echoing the expert’s enthusiasm or skepticism without qualification. Be fair, but not promotional.

** Summary**

- Begin with a **brief contextual introduction**: who the expert is, their background/relevance, and what relationship (if any) they have with the company under discussion (e.g., investor, advisor, ex-employee, prospect, competitor, client). Give a **neutral summary of the expert’s overall tone**: are they generally positive, negative, or mixed on the company?
- Do not give any contenxt on the interviewers ie the investor or the owner of the fund that is running the interview.
- Capture the **key takeaways** about the company gained through the conversation — especially information not found in marketing materials or pitch decks (e.g., insights on product-market fit, quality of the product, how it compares with competition, traction, internal dynamics, client experience, or market outlook).
`,
      `${formObject.transcript}`,
      "gpt-4o-mini",
      z.object({ summary: BulletSchema }),
    );

    const highlights = await oai_v2.text.textChat(
      `You are an AI analyst reviewing transcripts of expert calls conducted by investment professionals. Your task is to extract objective and insightful investment intelligence from the transcript in a structured format, suitable for internal decision-making.

For each transcript, produce a **three-part summary** written in clear, concise, and professional language. **Each section should contain no more than 3–4 bullet points**. Write in an objective tone — avoid echoing the expert’s enthusiasm or skepticism without qualification. Be fair, but not promotional.

** Highlights**

List 3–4 points the expert raised as **positives** or **strengths** of the company. These might include:

- Product capabilities or differentiation
- Market opportunity or client momentum
- Quality of the management team
- Effective go-to-market strategy
- Technological innovation or defensibility
- Anything they do differently

Write these points in neutral, evaluative language — even if the expert is highly enthusiastic, avoid parroting their excitement; instead, distill what substantively makes the point strong.
`,
      `${formObject.transcript}`,
      "gpt-4o-mini",
      z.object({ highlights: BulletSchema }),
    );

    const challenges = await oai_v2.text.textChat(
      ` You are an AI analyst reviewing transcripts of expert calls conducted by investment professionals. Your task is to extract objective and insightful investment intelligence from the transcript in a structured format, suitable for internal decision-making.

For each transcript, produce a **three-part summary** written in clear, concise, and professional language. **Each section should contain no more than 3–4 bullet points**. Write in an objective tone — avoid echoing the expert’s enthusiasm or skepticism without qualification. Be fair, but not promotional.

** Lowlights**

List 3–4 points the expert raised as **negatives**, **risks**, or **challenges**. These might include:

- Product limitations or gaps
- Execution challenges (e.g., implementation problems, team issues)
- Competitive threats
- Sales difficulties or long sales cycles
- Misalignment with client needs or poor ROI

If the expert’s concerns seem overly anecdotal or speculative, note that — but do not dismiss them outright. The tone should remain analytical and cautious, not critical or dismissive.`,
      `${formObject.transcript}`,
      "gpt-4o-mini",
      z.object({ challenges: BulletSchema }),
    );

    // console.log("summary", summary);
    // console.log("highlights", highlights);
    // console.log("challenges", challenges);

    console.log(formObject.externalParticipantRelationship);
    const callId = uuidv4();
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

    await db.call.create({ ...newCall });

    console.log("Call created.");
  }

  return null;
}
