import { LoaderFunctionArgs } from "@remix-run/node";

import { auth } from "@/server/auth/auth";
import { JobFileType, ProcessingStatus } from "@/lib/types";
import { MessageProcessing } from "@/server/eventSubscribers/dataProcessingQueueSubscriber";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Resource } from "sst";
const sqs = new SQSClient({});

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const authObj = await auth(request);
    if (!authObj) {
      console.log("Unauthorized");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      console.log("File ID is required");
      return Response.json({ error: "File ID is required" }, { status: 400 });
    }

    const message: MessageProcessing = {
      type: JobFileType.FILE,
      fileId: fileId,
      nextStep: ProcessingStatus.A_STARTED,
    };

    console.log("Sending email to processing queue");
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: Resource.DataProcessingQueue.url,
        MessageBody: JSON.stringify(message),
      }),
    );

    return "ok";
  } catch (error) {
    console.error("Error fetching job:", error);
    return Response.json(
      { error: "Failed to fetch job status" },
      { status: 500 },
    );
  }
}
