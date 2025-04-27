import { useState } from "react";
import { Link } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { FileType } from "@/lib/types";
import { validFileCategories } from "./FileCategoryDragAndDrop";
import { Badge } from "../ui/badge";
import yazrClient from "@/lib/yazr.client";
import { useNavigate } from "@remix-run/react";
import { DownloadIcon, TrashIcon } from "lucide-react";
export function BusinessFilesViewer({ files }: { files: FileType[] }) {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<boolean>(false);
  const navigate = useNavigate();
  async function handleDeleteFile(fileId: string) {
    setDeletingFile(true);
    await yazrClient.file.delete(fileId);
    setDeletingFile(false);
    navigate(0);
  }
  return (
    <div>
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="sm:max-w-[925px] bg-gray-100 h-[calc(100vh-100px)] flex flex-col">
          <DialogHeader>
            <DialogTitle>{previewFileName}</DialogTitle>
          </DialogHeader>
          <iframe
            className="flex flex-grow"
            src={previewFileUrl || ""}
          ></iframe>
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        {files.map((file, index) => (
          <div key={index} className="flex items-center justify-between pl-4">
            <div>
              <div>
                {file.fileName.length > 35
                  ? file.fileName.slice(0, 35) + "..."
                  : file.fileName}
              </div>
              <div className="text-sm text-gray-500 flex gap-2 mt-1 items-center">
                <p className="text-gray-500 text-xs">
                  Uploaded on{" "}
                  {new Date(file.uploadDate)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(",", "")}
                </p>
                <Badge variant="outline">{file.fileFormat}</Badge>
                <Link to={`/dashboard/onepagers/${file.jobId}`}>
                  <Badge variant="outline">{file.status}</Badge>
                </Link>
              </div>
            </div>
            <div className="flex gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" className="">
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the file "{file.fileName}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        handleDeleteFile(file.fileId);
                      }}
                    >
                      {deletingFile ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {/* {file.fileFormat === "pdf" ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    // setPreviewFileUrl(file.fileUrl);
                    // setPreviewFileName(file.fileName);
                    // setPreviewModalOpen(true);
                    window.open("./" + file.fileUrl, "_blank");
                  }}
                >
                  <DownloadIcon className="w-4 h-4" />
                </Button>
              ) : (
                <Link to={file.fileUrl} target="_blank" rel="noreferrer">
                  <Button variant="secondary">View</Button>
                </Link>
              )} */}
            </div>
          </div>
        ))}
      </div>
      {/* <Accordion type="multiple">
        {validFileCategories.map((category) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger>
              {category} (
              {files
                ? files.filter(
                    (file) =>
                      file.category.toLowerCase() === category.toLowerCase(),
                  ).length
                : 0}
              )
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {files
                  ?.filter(
                    (file) =>
                      file.category.toLowerCase() === category.toLowerCase(),
                  )
                  .map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between pl-4"
                    >
                      <div>
                        <div>
                          {file.fileName.length > 20
                            ? file.fileName.slice(0, 20) + "..."
                            : file.fileName}
                        </div>
                        <div className="text-sm text-gray-500 flex gap-2 mt-1">
                          <Badge variant="outline">{file.fileFormat}</Badge>
                          <Badge variant="outline">{file.status}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="secondary"
                              className="text-red-500"
                            >
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the file "
                                {file.fileName}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  handleDeleteFile(file.fileId);
                                }}
                              >
                                {deletingFile ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {file.fileFormat === "pdf" ? (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setPreviewFileUrl(file.fileUrl);
                              setPreviewFileName(file.fileName);
                              setPreviewModalOpen(true);
                            }}
                          >
                            View
                          </Button>
                        ) : (
                          <Link
                            to={file.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button variant="secondary">View</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion> */}
    </div>
  );
}
