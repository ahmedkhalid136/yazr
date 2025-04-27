import { Button } from "./ui/button";
import { JobType, JobStatus } from "@/lib/types";

export interface DocPreviewProps {
  job: JobType;
}

export default function DocTile({
  job,
  onClick,
}: DocPreviewProps & { onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      className="min-w-[180px] w-[180px] h-[160px] rounded-lg py-2 px-4 text-left flex flex-col justify-start leading-none border-[1px] border-gray-200 "
      onClick={onClick}
    >
      {status === JobStatus.COMPLETED ? (
        <p className="text-lg font-medium">{job.companyDetails?.companyName}</p>
      ) : (
        <p className="text-lg font-medium">New business...</p>
      )}
      <div className="flex items-center gap-2">
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
          {job.status}
        </span>
        {job.status === JobStatus.PROCESSING && (
          <div className="w-2 h-2 rounded-full bg-green-500 animate-[blink_1s_ease-in-out_infinite]" />
        )}
      </div>

      <p className="text-xs font-normal mt-4">
        Submitted by: {job.creator.name}
      </p>
      <p className="text-[10px] text-gray-500 font-light">
        {new Date(job.createdAt).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </p>
      <p className="text-[10px] text-gray-500 font-light text-">
        Number of files: {job.fileUrls?.length || 0}
      </p>
    </Button>
  );
}
