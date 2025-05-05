import {
  FileStatus,
  JobStatus,
  MessageProcessing,
  ProcessingStatus,
  QueueJobType,
} from "@/lib/types_dep";
import { SQSEvent } from "aws-lambda";
// import { emailAnalysis } from "../processing/newFile/emailAnalysisHandler";
import { a_dataIntegrity } from "../processing/newFile/a_dataIntegrity";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Resource } from "sst";
import { b_fileConversion } from "../processing/newFile/b_fileConversion";
import { c_aiExtraction } from "../processing/newFile/c_aiExtraction";
// import { e_ragPreparation } from "../processing/jobs/e_ragPreparation";
import db from "@/lib/db.server_dep";
import fileAiAnalysis from "../processing/newFile/fileAiAnalysis";
import { jobAiAnalysis } from "../processing/newFile/jobAiAnalysis";
import { jobProfileCreation } from "../processing/newFile/jobProfileCreation";
import jobWebEnhancement from "../processing/newFile/jobWebEnhancement";
import { jobOnePager } from "../processing/newFile/jobOnePager";
import jobSendNotification from "../processing/newFile/jobSendNotification";
import pageSequencer from "../processing/newFile/pageSequencer";
import { sendEmail } from "@/lib/email.server";
import { jobFileSequencer } from "../processing/newFile/jobFileSequencer";
// import { g_onePager } from "../processing/newFile/g_onePager";
const sqs = new SQSClient({});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// The uploaded doc analysis
//
// 1. Receive the job object as an event from the DynamoDb job table
// 1b. Update the job status saying that the job has starterd
// 2. Each job starts with a file sequencer, that analyxes (at the moment) one file per time - it could do them in parallel
// 3. This will start a file analysis with its own sequencer that analyses each page of the document.
// 4. Update the job status saying that the document have been parsed into an image per page.
//      Per document
//        Per page
// 5. The AI analysis of the images starts with transofmring pdf pages in images and then in Markdown - openAI, anthropic, gemini separately
// 6. Should check the quality of the Page markdown with a simple eval (not build yet).
// 7. Update the page analysis key in the file object till completion, then update the file key in the job object.
// 8. Once all the files are analysed, start with the AI company profile creation.
// 9. Refine and get the citation points using RAG.
// 10. Get the PPTX and all data saved.
//
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const handler = async (event: SQSEvent) => {
  console.log("Processing event");
  const message: MessageProcessing = JSON.parse(event.Records[0]?.body);
  const timeNow = new Date().getTime();
  await recursiveStateMachine(message, timeNow);
};

const recursiveStateMachine = async (
  message: MessageProcessing,
  timeout: number,
) => {
  const timeNow = timeout;
  try {
    if (message.type === QueueJobType.FILE) {
      console.log("File Processing Queue Event");
      console.log("item id", message.id);

      switch (message.nextStep) {
        case ProcessingStatus.FILE_UPLOAD_START:
          try {
            console.log("[ ] Data integrity check started");
            const res = await a_dataIntegrity(message.id as string);
            if (!res.ok) throw new Error("Data integrity check failed");
            console.log("[v] Data integrity check passed");
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_CONVERSION_START,
              other: undefined,
              timeout: timeNow,
            });
            break;
          } catch (error) {
            console.log("[x] Data integrity check failed", error);
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: ProcessingStatus.FILE_UPLOAD_START + message.id,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.FILE_CONVERSION_START:
          try {
            console.log("[ ] File conversion started");
            const res = await b_fileConversion(message.id as string);
            if (!res.ok) throw new Error("File conversion failed");
            console.log("[v] File conversion passed");

            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.PAGE_SEQUENCER,
              other: undefined,
              timeout: timeNow,
            });

            break;
          } catch (error) {
            console.log("[x] File conversion failed", error);
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: ProcessingStatus.FILE_CONVERSION_START + message.id,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.PAGE_SEQUENCER:
          try {
            console.log("[ ] Page sequencer started");
            const { imageUrl, command } = await pageSequencer(
              message.id as string,
            );
            console.log("[v] Page sequencer passed");

            await sendFileEvent({
              id: message.id,
              nextStep: command,
              other: imageUrl,
              timeout: timeNow,
            });
          } catch (error) {
            console.log("[x] Page sequencer failed", error);
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: ProcessingStatus.PAGE_SEQUENCER + message.id,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.PAGE_AI_EXTRACTION_START:
          try {
            console.log("[ ] AI extraction started");
            const res = await c_aiExtraction(
              message.id as string,
              message.other as string,
            );
            if (!res.ok) throw new Error("AI extraction failed");
            console.log("[v] AI extraction passed");
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.PAGE_DATA_IMPROVEMENT_START,
              other: message.other,
              timeout: timeNow,
            });
            break;
          } catch (error) {
            console.log("[x] AI extraction failed for image", message.other);
            console.log("error", error);
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: ProcessingStatus.PAGE_AI_EXTRACTION_START + message.other,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.PAGE_DATA_IMPROVEMENT_START:
          try {
            console.log("[ ] Data improvement started");
            // do something like you take the markdown just created and you ask an AI to see if there is any mistake/diff (maybe you could even shorten the lenght) and you give a score! (eval)
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.PAGE_SEQUENCER,
              other: undefined,
              timeout: timeNow,
            });

            console.log("[v] Data improvement passed");
          } catch (error) {
            console.error("[x] Data improvement failed", error);
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: ProcessingStatus.PAGE_DATA_IMPROVEMENT_START + message.id,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.FILE_AI_ANALYSIS_START:
          try {
            console.log("[ ] FILE_AI_ANALYSIS_START");
            const res = await fileAiAnalysis(message.id as string);
            if (!res.ok) throw new Error("File AI analysis failed");
            console.log("[v] FILE_AI_ANALYSIS_START passed");
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_COMPLETED,
              other: undefined,
              timeout: timeNow,
            });
          } catch (error) {
            console.log("[x] FILE_AI_ANALYSIS_START failed", error);
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: ProcessingStatus.FILE_AI_ANALYSIS_START + message.id,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.FILE_COMPLETED:
          try {
            console.log("[ ] FILE_COMPLETED");

            const file = await db.file.get(message.id);
            if (!file) {
              console.log("No file");
              throw new Error("No file");
            }
            await db.file.update({
              ...file,
              status: FileStatus.COMPLETED,
              updatedAt: new Date().toISOString(),
            });

            const job = (await db.job.queryFromJobId(file?.jobId))?.[0];
            if (!job) {
              console.log("No job");
              throw new Error("No job");
            }
            console.log("[v] FILE_COMPLETED passed");

            const filesStatus = job.fileStatus.map((file) =>
              file.fileId === message.id
                ? { ...file, status: FileStatus.COMPLETED }
                : file,
            );
            await db.job.update({
              ...job,
              fileStatus: filesStatus,
              updatedAt: new Date().toISOString(),
            });

            console.log(
              "[v] FILE_COMPLETED passed",
              `files:${filesStatus.length}; fileCompleted:${filesStatus.filter((file) => file.status === FileStatus.COMPLETED).length}`,
            );

            await sendJobEvent({
              id: file.jobId,
              nextStep: ProcessingStatus.JOB_FILE_SEQUENCER,
              other: undefined,
              timeout: timeNow,
            });

            break;
          } catch (error) {
            console.log("[x] FILE_COMPLETED failed", error);
            await sendFileEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: ProcessingStatus.FILE_COMPLETED + message.id,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.FILE_FAILED: {
          console.log("[x]  Processing failed handler");
          console.log("message", message);
          await sendEmail(
            "alfredo@yazr.ai",
            "error",
            `<p>File ${message.id} failed</p>
          <p>Error at: ${message.other}</p>
          `,
          );
          const file = await db.file.get(message.id as string);
          if (file) {
            await db.file.update({ ...file, status: FileStatus.FAILED });
          }
          break;
        }
      }
    }

    if (message.type === QueueJobType.JOB) {
      console.log("Job Processing Queue Event");
      console.log("item id", message.id);
      console.log("item nextStep", message.nextStep);
      switch (message.nextStep) {
        case ProcessingStatus.JOB_FILE_SEQUENCER:
          try {
            console.log("[ ] Job file sequencer started");
            const { nextId, command } = await jobFileSequencer(message.id);
            if (nextId && command) {
              console.log("[v] Job file sequencer passed");
              if (command === ProcessingStatus.FILE_UPLOAD_START) {
                await sendFileEvent({
                  id: nextId,
                  nextStep: command,
                  other: undefined,
                  timeout: timeNow,
                });
              } else {
                await sendJobEvent({
                  id: nextId,
                  nextStep: command,
                  other: undefined,
                  timeout: timeNow,
                });
              }
            }
          } catch (error) {
            console.log("[x] Job file sequencer failed", error);
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: undefined,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.JOB_AI_ANALYSIS:
          try {
            console.log("[ ] Job AI analysis started");
            const res = await jobAiAnalysis(message.id as string);
            if (!res.ok) throw new Error("Job AI analysis failed");
            console.log("[v] Job AI analysis passed");
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.JOB_WEB_ENHANCEMENT,
              other: undefined,
              timeout: timeNow,
            });
            break;
          } catch (error) {
            console.log("[x] Job AI analysis failed", error);
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: undefined,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.JOB_WEB_ENHANCEMENT:
          try {
            console.log("[ ] Job web enhancement started");
            const res = await jobWebEnhancement(message.id as string);
            if (!res.ok) throw new Error("Job web enhancement failed");
            console.log("[v] Job web enhancement passed");
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.JOB_PROFILE_CREATION,
              other: undefined,
              timeout: timeNow,
            });
          } catch (error) {
            console.log("[x] Web enhancement failed", error);
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: undefined,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.JOB_PROFILE_CREATION:
          try {
            console.log("[ ] Job profile creation started");
            const res = await jobProfileCreation(message.id as string);
            if (!res.ok) throw new Error("Job profile creation failed");
            console.log("[v] Job profile creation passed");
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.JOB_ONE_PAGER_CREATION,
              other: undefined,
              timeout: timeNow,
            });
          } catch (error) {
            console.log("[x] Job profile creation failed", error);
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.FILE_FAILED,
              other: undefined,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.JOB_RAG_PREPARATION:
          console.log("[ ] Job RAG preparation started");
          console.log("doing nothing at this stage");
          // we take the markdownfile, turn it into a pdf that accomodates the pages in the same order as in the filez and we ask the AI to find the profile details, confirm the info and get the info about the position of the data bit in the doc, that should be easily findable then in the progonal file.
          console.log("[v] Job RAG preparation started");
          break;
        case ProcessingStatus.JOB_ONE_PAGER_CREATION:
          try {
            console.log("[ ] Job one pager creation started");
            const res = await jobOnePager(message.id as string);
            if (!res.ok) throw new Error("Job one pager creation failed");
            console.log("[v] Job one pager creation passed");
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.JOB_NOTIFICATION_SEND,
              other: undefined,
              timeout: timeNow,
            });
          } catch (error) {
            console.log("[x] Job one pager creation failed", error);
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.JOB_FAILED,
              other: undefined,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.JOB_ONE_MINUTE_PODCAST_CREATION:
          console.log("[ ] Job one minute podcast creation started");
          console.log("doing nothing at this stage");
          break;
        case ProcessingStatus.JOB_NOTIFICATION_SEND:
          try {
            console.log("[ ] Job notification send started");
            const res = await jobSendNotification(message.id as string);
            if (!res.ok) throw new Error("Job notification send failed");
            console.log("[v] Job notification send passed");
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.JOB_COMPLETED,
              other: undefined,
              timeout: timeNow,
            });
          } catch (error) {
            console.log("[x] Job notification send failed", error);
            await sendJobEvent({
              id: message.id,
              nextStep: ProcessingStatus.JOB_FAILED,
              other: undefined,
              timeout: timeNow,
            });
          }
          break;
        case ProcessingStatus.JOB_COMPLETED: {
          console.log("[ ] Job completed started");
          const job = (await db.job.queryFromJobId(message.id as string))?.[0];
          if (job) {
            await db.job.update({ ...job, status: JobStatus.COMPLETED });
            await sendEmail(
              "alfredo@yazr.ai",
              `Completion of Job for ${job.creator.email}-${job.companyDetails?.companyName}`,
              `<p>Job ${message.id} completed</p>
          `,
            );
          }

          break;
        }
        case ProcessingStatus.JOB_FAILED:
          console.log("[x]  Processing Job failed handler");
          await sendEmail(
            "alfredo@yazr.ai",
            "error",
            `<p>Job ${message.id} failed</p>
          <p>Error at: ${message.other}</p>
          `,
          );
          const job = (await db.job.queryFromJobId(message.id as string))?.[0];
          if (job) {
            await db.job.update({ ...job, status: JobStatus.FAILED });
          }
          break;
      }
    }
  } catch (error) {
    console.log("[x] Processing failed", error);
    await sendEmail(
      "alfredo@yazr.ai",
      "error",
      `<p>Processing failed</p>
      `,
    );
  }
};

const TEN_MINUTED_TIMEOUT = 600000;
export const sendFileEvent = async ({
  id,
  nextStep,
  other,
  timeout,
}: {
  id: string;
  nextStep: ProcessingStatus;
  other?: string;
  timeout: number;
}) => {
  const message: MessageProcessing = {
    type: QueueJobType.FILE,
    id: id,
    nextStep: nextStep,
    other: other,
  };
  const timeNow = new Date().getTime();
  if (timeNow - timeout < TEN_MINUTED_TIMEOUT) {
    console.log("time - recursive", timeNow - timeout);
    await recursiveStateMachine(message, timeout);
  } else {
    console.log("time - sqs", timeNow - timeout);
    console.log("sqs -Sending file event", message.nextStep, message.id);
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: Resource.DataProcessingQueue.url,
        MessageBody: JSON.stringify(message),
      }),
    );
  }
};

export const sendJobEvent = async ({
  id,
  nextStep,
  other,
  timeout,
}: {
  id: string;
  nextStep: ProcessingStatus;
  other?: string;
  timeout: number;
}) => {
  const message: MessageProcessing = {
    type: QueueJobType.JOB,
    id: id,
    nextStep: nextStep,
    other: other,
  };
  const timeNow = new Date().getTime();
  if (timeNow - timeout < TEN_MINUTED_TIMEOUT) {
    console.log("time - ", timeNow - timeout);
    await recursiveStateMachine(message, timeout);
  } else {
    console.log("time - sqs", timeNow - timeout);
    console.log("sqs -Sending job event", message.nextStep, message.id);
    await sqs.send(
      new SendMessageCommand({
        QueueUrl: Resource.DataProcessingQueue.url,
        MessageBody: JSON.stringify(message),
      }),
    );
  }
};
