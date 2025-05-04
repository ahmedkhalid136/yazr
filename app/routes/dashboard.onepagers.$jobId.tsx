// import Search from "@/components/Search";

import { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import db from "@/lib/db.server_dep";
import {
  FileType,
  MessageProcessing,
  ProcessingStatus,
  QueueJobType,
} from "@/lib/types";

import { auth } from "@/.server/auth/auth";
import { Button } from "@/components/ui/button";
import { File } from "lucide-react";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { Resource } from "sst";
import MetadataJob from "@/components/MetadataJob";
import MarkdownUrl from "@/components/MarkdownUrl";
const sqs = new SQSClient({});

export default function Job() {
  const { job, files } = useLoaderData<typeof loader>();
  const [ms, setMs] = useState<string[]>([]);
  const [file, setFile] = useState<FileType | null>(files[0]);

  const imageNames = file?.imageUrls?.map((f) => f.split("/").pop());
  imageNames?.sort((a, b) => {
    const aNumber = parseInt(a?.split(".")[0].split("-")[1] || "0");
    const bNumber = parseInt(b?.split(".")[0].split("-")[1] || "0");
    console.log("aNumber", aNumber);
    return aNumber - bNumber;
  });
  return (
    <div className="w-full h-full p-6 gap-6 md:min-w-[800px] md:max-w-[1024px]">
      <Form
        method="POST"
        action="/dashboard/onepagers/$jobId"
        className="flex justify-start items-center w-full h-fit my-4 gap-2"
      >
        {/* <Button onClick={refreshJob} type="button">
          Refresh job
        </Button> */}

        {Object.keys(ProcessingStatus).map((status) => (
          <div key={status} className="text-xs flex justify-start items-center">
            <Button
              variant="outline"
              type="submit"
              name="action"
              value={ProcessingStatus[status as keyof typeof ProcessingStatus]}
              size="sm"
            >
              <input type="hidden" name="jobId" value={job?.jobId} />
              <p>{status}</p>
            </Button>
          </div>
        ))}
      </Form>
      <div className="flex justify-start items-start gap-4">
        <div className="w-[400px]">{job && <MetadataJob {...job} />}</div>
        <div>
          <h1 className="text-2xl font-bold text-center">Layer 1</h1>
          {imageNames?.map((f) => {
            try {
              return (
                <div key={f} className="flex justify-start items-center">
                  <img
                    src={`/api/files/image/get/${file?.fileId}/${f}`}
                    alt="image"
                  />
                  <MarkdownUrl
                    src={`/api/files/markdown/get/${file?.fileId}/${f}`}
                  />
                </div>
              );
            } catch {
              return (
                <div key={f} className="flex justify-start items-center">
                  <p>Error loading image</p>
                </div>
              );
            }
          })}
        </div>
        {/* <div>{ms && ms.map((m) => <Markdown text={m} />)}</div>
        {preLayer2 && <Markdown text={preLayer2} />}
        {layer2 && <Markdown text={layer2} />}
        {/* <Markdown text={layer3} /> */}
        {/* {companyProfile && (
          <div className="w-[800px] h-full">
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(JSON.parse(companyProfile), null, 2)}
            </pre>
          </div>
        )} */}
      </div>
    </div>
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const authorised = await auth(request);

  if (!authorised?.userId || !authorised?.workspaceId) {
    console.log("redirecting to onboard from dashboard??");
    // return redirect("/onboard");
  }
  const jobId = params.jobId || "";
  // console.log("authorised workspaceId", authorised?.workspaceId);
  // console.log("authorised userId", authorised?.userId);
  const job = (await db.job.queryFromJobId(jobId))?.[0];

  if (!job) {
    console.log("redirecting?");
    return redirect("/dashboard");
  }

  const files = await db.file.queryFromJobId(jobId);

  return {
    job,
    files,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const authorised = await auth(request);

  const sendJobEvent = async ({
    id,
    nextStep,
    other,
  }: {
    id: string;
    nextStep: ProcessingStatus;
    other?: string;
  }) => {
    const message: MessageProcessing = {
      type: QueueJobType.JOB,
      id: id,
      nextStep: nextStep,
      other: other,
    };

    await sqs.send(
      new SendMessageCommand({
        QueueUrl: Resource.DataProcessingQueue.url,
        MessageBody: JSON.stringify(message),
      }),
    );
  };

  if (!authorised?.userId || !authorised?.workspaceId) {
    console.log("redirecting to onboard from dashboard action?");
    // return redirect("/onboard");
  }
  const formData = await request.formData();
  const jobId = formData.get("jobId");
  const action = formData.get("action");
  console.log("Mandiamo questo messaggio", action);
  console.log("jobId", jobId);
  console.log("action", action);

  await sendJobEvent({
    id: jobId as string,
    nextStep: action as ProcessingStatus,
    other: "",
  });
  return redirect(`/dashboard/onepagers/${jobId}`);
}
