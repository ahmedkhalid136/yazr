import { v4 as uuidv4 } from "uuid";
import s3 from "@/.server/s3.server";
import {
  FileType,
  JobStatus,
  ProcessPhase,
  JobType,
  JobFileType,
  FileStatus,
} from "@/lib/types";
import yazrServer from "@/lib/yazr.server";
import { S3Event, S3EventRecord, SESEvent } from "aws-lambda";
import { extract, LetterparserAttachment } from "letterparser";
import db from "@/lib/db.server_dep";
import { folders } from "@/lib/utils";

const eventRecordToEmail = async (record: S3EventRecord) => {
  const s3EventRecord = record as S3EventRecord;
  // console.log("S3 - event.body", JSON.stringify(s3EventRecord, null, 2));
  const s3Object = s3EventRecord.s3;
  const key = s3Object.object.key;
  const size = s3Object.object.size;
  console.log("S3 - key", key);
  console.log("S3 - size", size);

  const emailBuffer = await s3.emailStoring.get(key);

  //turn buffer into string
  const emailString = Buffer.from(emailBuffer).toString("utf-8");

  //parse email
  const email = extract(emailString);
  console.log("email from", email.from);
  console.log("email html", email.html);
  console.log("email text", email.text);
  return email;
};
const saveAttachmentToS3 = async (
  attachment: LetterparserAttachment,
  workspaceId: string,
  jobId: string,
): Promise<string | null> => {
  const file = new File([attachment.body], attachment.filename!);

  if (!file) {
    console.log("No files found in email");
    return null;
  }

  const folderPath = folders.rawFiles({ workspaceId, jobId });
  const fileUrl = await yazrServer.uploadFileToS3(file, folderPath);
  return fileUrl;
};
const hashAttachment = async (attachment: LetterparserAttachment) => {
  const file = new File([attachment.body], attachment.filename!);
  return yazrServer.computeFileHash(file);
};
export async function handler(event: SESEvent | S3Event) {
  try {
    const record = event.Records[0];

    if (record.eventSource === "aws:s3") {
      const jobId = uuidv4();
      const workspaceId = process.env.IS_DEV
        ? "bf4652e1-3203-4572-9f86-70ada7032882"
        : "df16f5b8-c3ac-4b38-a9f2-87135039584b";
      const fileProfiles: FileType[] = [];
      const fileUrls: string[] = [];
      const businessId = uuidv4();
      const email = await eventRecordToEmail(record as S3EventRecord);
      for (const attachment of email.attachments || []) {
        const fileUrl = await saveAttachmentToS3(
          attachment,
          workspaceId,
          jobId,
        );
        if (!fileUrl) {
          continue;
        }
        const hash = await hashAttachment(attachment);

        const fProfile: FileType = {
          fileId: uuidv4(),
          fileUrl: fileUrl,
          workspaceId,
          jobId,
          businessId: businessId,
          category: "Other",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: FileStatus.PENDING,
          uploadDate: new Date().toISOString(),
          retryCount: 0,
          fileName: fileUrl.split("/").pop() as string,
          userId: email?.from?.address || "TBD",
          fileFormat: fileUrl.split(".").pop()?.toLowerCase() as string,
          from: email.from?.address as string,
          processPhase: ProcessPhase.DATA_UPLOADING,
          fileSignature: hash,
        };

        await db.file.create(fProfile);
        fileProfiles.push(fProfile);
        fileUrls.push(fileUrl);
      }

      const newJob: JobType = {
        userId: email?.from?.address || "TBD",
        jobId: jobId,
        fileUrls: fileUrls,
        status: JobStatus.PENDING,
        constIndex: "constIndex",
        type: JobFileType.EMAIL,
        workspaceId,
        createdAt: new Date().toISOString(),
        businessProfileId: businessId,
        creator: {
          email: email.from?.address as string,
          name: email.from?.name as string,
          surname: email.from?.name as string,
        },
        fileStatus: fileProfiles.map((f) => ({
          fileId: f.fileId,
          fileUrl: f.fileUrl,
          status: FileStatus.PENDING,
        })),
      };
      await db.job.create(newJob);

      return {
        ok: true,
      };
    }
    return {
      ok: false,
    };
  } catch (error) {
    console.error("Error in emailManagement/receiver.server.ts", error);
    return {
      ok: false,
    };
  }
}
