import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, File } from "lucide-react";
import { Link } from "@remix-run/react";
import { JobType } from "@/lib/types_dep";

export default function MetadataJob(props: JobType) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatFileName = (url: string) => {
    return url.split("/").pop() || url;
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="w-[400px]">
        <CardHeader>
          <div className="flex flex-col gap-2 justify-start">
            <Badge className={getStatusColor(props.status) + " w-fit"}>
              {props.status.toUpperCase()}
            </Badge>
            <CardTitle className="text-2xl">Job Details</CardTitle>
            <CardDescription>Created by {props.creator.name}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Job ID</h3>
              <p className="mt-1 text-sm">{props.jobId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1 text-sm">{props.type}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1 text-sm">
                {format(new Date(props.createdAt), "PPpp")}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Process Phase
              </h3>
              <p className="mt-1 text-sm">{props.processPhase}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Retry Count</h3>
              <p className="mt-1 text-sm">{props.retryCount}</p>
            </div>
          </div>
          <div className="flex justify-start items-center w-full h-full">
            <div className=" w-full  px-2 py-6 ">
              <h4 className="text-sm font-medium text-gray-500">Files</h4>
              {props.fileUrls?.map((f) => (
                <Link to={f} key={f}>
                  <div className="text-xs flex justify-start items-center ">
                    <File className="w-4 h-4 text-gray-500" />
                    <p className="ml-2 text-gray-500 font-semibold">
                      {f.split("/").pop()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {props.onePagerUrl && (
        <Card>
          <CardHeader>
            <CardTitle>One Pager</CardTitle>
            <CardDescription>Download the generated one pager</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => window.open(props.onePagerUrl, "_blank")}
            >
              <Download className="mr-2 h-4 w-4" />
              Download One Pager
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
