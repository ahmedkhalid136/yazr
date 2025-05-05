"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { JobType, JobStatus, FileType } from "@/lib/types_dep";

import { ChevronsUpDown, Download, RefreshCw, Trash2Icon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Form, Link, useFetcher } from "@remix-run/react";
import Chat from "./Chat";

export default function DrawerDoc({
  job,
  open,
  setOpen,
  files,
}: {
  job: JobType | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  files: FileType[] | [];
}) {
  const fetcher = useFetcher();
  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm flex flex-col justify-between h-full pb-12">
          <DrawerHeader>
            <DrawerTitle className="flex justify-between items-center gap-2">
              Document analysis
              <div className="flex justify-end items-center">
                <Form method="POST" action="/dashboard/remove">
                  <input type="hidden" name="action" value="remove" />
                  <Button
                    variant="outline"
                    type="submit"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                  <Link to={`/dashboard/job/${job?.jobId}`}>Go to job</Link>
                  <input
                    type="hidden"
                    name="workspaceId"
                    value={job?.workspaceId}
                  />
                  <input
                    type="hidden"
                    name="createdAt"
                    value={job?.createdAt}
                  />
                  <input
                    type="hidden"
                    name="fileUrls"
                    value={JSON.stringify(job?.fileUrls)}
                  />
                  <input type="hidden" name="jobId" value={job?.jobId} />
                </Form>
              </div>
            </DrawerTitle>
            <DrawerDescription>Review the analysis process.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <Card
              className={`bg-gray-100 py-0 ${
                job?.status !== JobStatus.COMPLETED ? "opacity-50" : ""
              }`}
            >
              <CardContent className="flex flex-col items-start justify-center space-y-2 pt-2 pb-4 w-full">
                <p className="p-0">
                  Company name: {job?.companyDetails?.companyName}
                </p>
                <div className="w-full flex justify-start mt-2">
                  <Link
                    to={`/dashboard/business/${job?.companyDetails?.companyId}`}
                  >
                    <Button disabled={job?.status !== JobStatus.COMPLETED}>
                      Profile page
                    </Button>
                  </Link>
                  {/* <Link to={`/api/doc/pdf/create/${job?.jobId}.pdf`}> */}
                  {/* <Link
                    to={`${PDF_CREATOR_URL}/?jobId=${job?.jobId}`}
                    target="_blank"
                    rel="noreferrer"
                  > */}
                  <Link
                    to={`/api/doc/download/${job?.jobId}/onepager.pptx`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      className="ml-2"
                      disabled={job?.status !== JobStatus.COMPLETED}
                    >
                      One pager <Download className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <Collapsible
              className="w-full space-y-2 mt-4"
              defaultOpen={job?.status !== JobStatus.COMPLETED}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 w-full flex justify-between"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-base font-normal">
                      File analysis status
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job?.status === JobStatus.COMPLETED
                            ? "bg-green-100 text-green-800"
                            : job?.status === JobStatus.FAILED
                              ? "bg-red-100 text-red-800"
                              : job?.status === JobStatus.PROCESSING
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {job?.status}
                      </span>
                      {job?.status === JobStatus.PROCESSING && (
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-[blink_1s_ease-in-out_infinite]" />
                      )}
                    </div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-2">
                <ScrollArea className="h-[300px]">
                  {files.map((file) => (
                    <div className="mb-2 px-2" key={file.fileId}>
                      {/* <Card>
                        <CardHeader className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <p>{file.fileName}</p>
                            <fetcher.Form
                              method="GET"
                              action={`/api/files/refresh/${file.fileId}`}
                            >
                              <Button variant="outline" size="sm" type="submit">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </fetcher.Form>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {Object.keys(ProcessPhase)
                            .filter((key) => isNaN(Number(key)))
                            .map((phaseKey) => {
                              const phase =
                                ProcessPhase[
                                  phaseKey as keyof typeof ProcessPhase
                                ];
                              return (
                                <div
                                  key={phase}
                                  className={`flex items-center space-x-2 w-full ${
                                    Number(file?.processPhase) >= phase
                                      ? "opacity-100"
                                      : "opacity-50"
                                  }`}
                                >
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      Number(file?.processPhase) >= phase
                                        ? "bg-green-500"
                                        : "bg-gray-300"
                                    }`}
                                  />
                                  <p>{ProcessPhaseSentence[phase]}</p>
                                </div>
                              );
                            })}
                        </CardContent>
                      </Card> */}
                    </div>
                  ))}
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="w-full space-y-2  mt-4">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 w-full flex justify-between"
                >
                  <p className="text-base font-normal">Extracted data</p>
                  <ChevronsUpDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-2">
                <ScrollArea className="h-[300px]">
                  <Accordion type="single" collapsible className="w-full">
                    <pre className="text-xs">{job?.jobId}</pre>
                    {job?.rawData && typeof job.rawData === "object" ? (
                      Object.entries(job.rawData).map(([key, value]) => (
                        <AccordionItem key={key} value={key}>
                          <AccordionTrigger className="text-sm font-medium">
                            {key}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-sm whitespace-pre-wrap p-2 bg-muted rounded-md">
                              {typeof value === "object"
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No data available
                      </p>
                    )}
                  </Accordion>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DrawerFooter>
            <Chat
              jobId={job?.jobId || null}
              active={job?.status === JobStatus.COMPLETED}
            />
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
