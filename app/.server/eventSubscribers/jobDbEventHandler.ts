import db from "@/lib/db.server_dep";
import {
  JobStatus,
  MessageProcessing,
  ProcessingStatus,
  QueueJobType,
} from "@/lib/types_dep";
import { DynamoDBStreamEvent } from "aws-lambda";
import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqs = new SQSClient({});

const checkJobIntegrity = async (
  createdAt: string,
  workspaceId: string,
): Promise<{ ok: boolean; jobId: string }> => {
  if (!createdAt || !workspaceId) {
    console.log("No createdAt or workspaceId");
    return { ok: false, jobId: "" };
  }
  const job = await db.job.get(workspaceId, createdAt);
  if (!job) {
    console.log("No job", job);
    return { ok: false, jobId: "" };
  }

  console.log("Job status", job.status);
  if (job.status !== JobStatus.PENDING) {
    console.log("Job not pending");
    return { ok: false, jobId: "" };
  }
  await db.job.update({
    ...job,
    status: JobStatus.PROCESSING,
  });
  return { ok: true, jobId: job.jobId };
};

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log("Job event");
  for (const record of event.Records) {
    switch (record.eventName) {
      case "INSERT": {
        console.log("Job insert event");
        const createdAt = record?.dynamodb?.Keys?.createdAt?.S || "";
        const workspaceId = record?.dynamodb?.Keys?.workspaceId?.S || "";
        console.log("Job id", createdAt, workspaceId);
        const { ok, jobId } = await checkJobIntegrity(createdAt, workspaceId);
        if (!ok) {
          return;
        }

        const message: MessageProcessing = {
          type: QueueJobType.JOB,
          id: jobId,
          nextStep: ProcessingStatus.JOB_FILE_SEQUENCER,
        };

        console.log("Sending message to processing queue");
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: Resource.DataProcessingQueue.url,
            MessageBody: JSON.stringify(message),
          }),
        );
        break;
      }
      case "MODIFY": {
        // do nothing
        break;
      }
    }
  }
};
