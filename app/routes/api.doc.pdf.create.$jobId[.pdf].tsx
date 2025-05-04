import { auth } from "@/.server/auth/auth";
import { LoaderFunctionArgs } from "@remix-run/node";
const PDF_CREATOR_URL = process.env.PDF_CREATOR_URL;

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const authObj = await auth(request);
    if (!authObj) {
      console.log("Unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authObj.userId;
    if (!userId) {
      console.log("Unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.jobId;
    if (!jobId) {
      console.log("Job ID is required");
      return Response.json({ error: "Job ID is required" }, { status: 400 });
    }
    console.log("fetching");
    const response = await fetch(`${PDF_CREATOR_URL}?jobId=${jobId}`);
    const pdf = await response.arrayBuffer();
    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("Error creating one-pager:", error);
    return Response.json(
      { error: "Failed to create one-pager" },
      { status: 500 },
    );
  }
}
