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
import { Download } from "lucide-react";

interface Creator {
  name: string;
  email: string;
  surname: string;
}

interface FileStatus {
  fileUrl: string;
  fileId: string;
  status: string;
}

interface JobDetailsProps {
  creator: Creator;
  status: string;
  jobId: string;
  createdAt: string;
  fileUrls: string[];
  retryCount: number;
  fileStatus: FileStatus[];
  workspaceId: string;
  userId: string;
  updatedAt: string;
  processPhase: string;
  onePagerUrl?: string;
  constIndex: string;
  type: string;
}

export function JobDetails(props: JobDetailsProps) {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Job Details</CardTitle>
              <CardDescription>Created by {props.creator.name}</CardDescription>
            </div>
            <Badge className={getStatusColor(props.status)}>
              {props.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
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
              <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
              <p className="mt-1 text-sm">
                {format(new Date(props.updatedAt), "PPpp")}
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>Associated files and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.fileStatus.map((file) => (
                <TableRow key={file.fileId}>
                  <TableCell>{formatFileName(file.fileUrl)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(file.status)}>
                      {file.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{file.fileId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
