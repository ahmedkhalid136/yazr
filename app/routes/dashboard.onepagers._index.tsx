import db from "@/lib/db.server";
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { JobType } from "@/lib/types";
import DrawerDoc from "@/components/DrawerDoc";
import { useState } from "react";
import { auth } from "@/.server/auth/auth";

export default function Companies() {
  const data = useLoaderData<typeof loader>();
  const [open, setOpen] = useState(false);
  const [job, setJob] = useState<JobType | null>(null);
  const handleClick = (jobId: string) => {
    setOpen(true);
    setJob(data.jobs.find((job: JobType) => job.jobId === jobId));
  };
  return (
    <div className="justify-start  w-full h-full p-6 flex flex-col gap-6 md:min-w-[800px] md:max-w-[1024px]">
      <h1 className="text-4xl font-bold items-end pt-12">Uploads</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Company</TableHead>
            <TableHead>Upload time</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.jobs &&
            data.jobs.map((job: JobType) => (
              <TableRow key={job.jobId} onClick={() => handleClick(job.jobId)}>
                <TableCell className="font-medium">
                  <Link to={`/dashboard/onepagers/${job.jobId}`}>
                    {job.companyDetails?.companyName || "Company..."}
                  </Link>
                </TableCell>
                <TableCell>{job.createdAt}</TableCell>
                <TableCell>{job.creator.name}</TableCell>
                <TableCell>{job.jobId}</TableCell>
                <TableCell className="text-right">{job.status}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const authData = await auth(request);
  console.log("authData", authData);
  const workspaceId = authData?.workspaceId;
  if (!workspaceId) {
    // return redirect("/onboard");
  }
  const jobs = await db.job.getLatest(workspaceId, 50);

  console.log("jobs", jobs);
  return Response.json({ jobs });
}
