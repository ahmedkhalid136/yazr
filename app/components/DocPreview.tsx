import { Form } from "@remix-run/react";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";
import { JobType, JobStatus } from "@/lib/types_dep";

export interface DocPreviewProps {
  job: JobType;
}

export default function DocPreview({
  job,
  onClick,
}: DocPreviewProps & { onClick?: () => void }) {
  const {
    jobId,
    createdAt,
    creator,
    status,
    companyDetails,
    fileUrls,
    workspaceId,
  } = job;
  return (
    <div>
      <div className="flex justify-start items-center gap-4">
        <Button
          variant="secondary"
          className="min-w-[180px] w-[180px] h-[120px] bg-gray-100 rounded-lg py-2 px-4 text-left"
          onClick={onClick}
        >
          <div>
            <p className="text-[10px] text-gray-500 font-light">
              {new Date(createdAt).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
            <p className="text-sm font-medium mt-4">{creator.name}</p>
            <p className="text-xs text-gray-500 font-light">
              Number of files: {fileUrls?.length || 0}
            </p>
            <div className="flex items-center gap-2 mt-5">
              <span
                className={`px-2 py-1 text-[10px] font-medium rounded-full ${
                  status === JobStatus.COMPLETED
                    ? "bg-green-100 text-green-800"
                    : status === JobStatus.FAILED
                      ? "bg-red-100 text-red-800"
                      : status === JobStatus.PROCESSING
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {status}
              </span>
              {status === JobStatus.PROCESSING && (
                <div className="w-2 h-2 rounded-full bg-green-500 animate-[blink_1s_ease-in-out_infinite]" />
              )}
            </div>
          </div>
        </Button>

        <Button
          variant="ghost"
          className="w-full px-4 border rounded-lg p-2 h-[120px] overflow-hidden text-left"
          onClick={onClick}
        >
          <div className="flex flex-col gap-2 w-full">
            <h2 className="text-sm font-medium">
              {companyDetails?.companyName}
            </h2>
            <p className="text-xs text-gray-900 leading-relaxed h-[64px] overflow-hidden text-ellipsis font-light whitespace-pre-line">
              {job?.rawData?.solution}
            </p>
            <p className="text-[10px] text-gray-900 leading-relaxed h-[16px] overflow-hidden text-ellipsis font-light">
              Company ID: {companyDetails?.companyId}
            </p>
          </div>
        </Button>

        <div className="flex justify-end items-center">
          <Form method="POST" action="/dashboard">
            <Button variant="outline" name="action" value="remove">
              <Trash2Icon className="w-4 h-4" />
            </Button>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <input type="hidden" name="createdAt" value={createdAt} />
            <input type="hidden" name="fileUrls" value={fileUrls} />
            <input type="hidden" name="jobId" value={jobId} />
          </Form>
        </div>
      </div>
    </div>
  );
}
