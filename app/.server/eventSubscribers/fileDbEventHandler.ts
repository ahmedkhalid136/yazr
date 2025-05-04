import db from "@/lib/db.server";
import {
  FileStatus,
  JobStatus,
  MessageProcessing,
  ProcessingStatus,
  QueueJobType,
} from "@/lib/types";
import { DynamoDBStreamEvent } from "aws-lambda";
import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqs = new SQSClient({});

const checkFileIntegrity = async (fileId: string): Promise<boolean> => {
  if (!fileId) {
    console.log("No Job Id");
    return false;
  }
  const file = await db.file.get(fileId);
  if (!file) {
    console.log("No file");
    return false;
    // throw new Error("Job not found");
  }
  if (!file.fileUrl) {
    console.log("No file URL");
    return false;
  }
  console.log("File", file);
  if (file.status !== FileStatus.PENDING) {
    console.log("Job not pending");
    return false;
  }
  return true;
};
const checkRightRecord = (record: DynamoDBStreamEvent["Records"][0]) => {
  if (record.eventName !== "INSERT") {
    console.log("Event not INSERT");
    return false;
  }
  console.log("Keys", record?.dynamodb?.Keys);
  return true;
};

export const handler = async (event: DynamoDBStreamEvent) => {
  console.log("File event");
  for (const record of event.Records) {
    switch (record.eventName) {
      case "INSERT": {
        if (!checkRightRecord(record)) {
          break;
        }
        const fileId = record?.dynamodb?.Keys?.fileId?.S || "";
        if (!checkFileIntegrity(fileId)) {
          return;
        }

        const message: MessageProcessing = {
          type: QueueJobType.FILE,
          id: fileId,
          nextStep: ProcessingStatus.FILE_UPLOAD_START,
        };

        console.log("Sending email to processing queue");
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: Resource.DataProcessingQueue.url,
            MessageBody: JSON.stringify(message),
          }),
        );
        break;
      }
      case "MODIFY": {
        break;
      }
    }
  }
};
