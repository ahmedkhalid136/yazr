import {
  Upload,
  CircleX,
  LoaderCircle,
  File,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useEffect } from "react";

export enum LocalFileState {
  UPLOADING = "uploading",
  UPLOADED = "uploaded",
  ERROR = "error",
}
export type FileNameState = {
  fileName: string;
  state: LocalFileState;
  text: string;
  fileId: string | undefined; // Only defined after uploaded to server
  category: string | undefined; // Only defiend after uploaded to server and categorised
};

// TODO define this somewhere more centrally
export const validFileTypes = ["pdf", "ppt", "pptx", "doc", "docx"];

export function getFileExtension(file: File) {
  const split = file.name.split(".");
  if (split && split.length > 1) {
    return split.pop()?.toLowerCase();
  } else {
    return "";
  }
}

function getFileStateIcon(state: LocalFileState) {
  if (state === LocalFileState.ERROR) {
    return <CircleX size={16} className="mr-2"></CircleX>;
  } else if (state === LocalFileState.UPLOADING) {
    return (
      <LoaderCircle size={16} className="mr-2 animate-spin"></LoaderCircle>
    );
  } else if (state === LocalFileState.UPLOADED) {
    return <CheckCircle size={16} className="mr-2"></CheckCircle>;
  } else {
    return "";
  }
}

const FileItem = ({
  file,
  fileNameState,
  onRemove,
}: {
  file: File;
  fileNameState: FileNameState | undefined;
  onRemove: () => void;
}) => {
  return (
    <div className="grid grid-cols-5 items-center justify-between bg-gray-0 p-2 rounded mt-2 gap-2">
      <div className="col-span-4 flex flex-row">
        <File size={32} className="mr-2" />
        <div className="flex flex-col">
          <p className="mb-2 text-md text-left">
            {file.name.length > 50
              ? file.name.substring(0, 50) + "..."
              : file.name}
          </p>
          <div className="flex flex-row gap-2">
            <Badge className="text-sm" variant="outline">
              {(file.size / 1024 / 1024).toFixed(2)}MB
            </Badge>
            <Badge className="text-sm" variant="outline">
              {getFileExtension(file).length > 0
                ? getFileExtension(file).toUpperCase()
                : "Unknown Type"}
            </Badge>
            <Badge
              className={
                "text-sm" +
                (fileNameState?.state === "uploaded"
                  ? " bg-green-500 text-white"
                  : "")
              }
              variant={
                fileNameState?.state === LocalFileState.ERROR
                  ? "destructive"
                  : "outline"
              }
            >
              {fileNameState ? getFileStateIcon(fileNameState.state) : ""}{" "}
              {fileNameState?.text}
            </Badge>
          </div>
        </div>
      </div>
      <div className="h-full flex flex-row gap-2 justify-end items-center">
        <Button onClick={onRemove} className=" h-full" variant="ghost">
          <Trash2 size={12} className="mr-2" />
        </Button>
        {fileNameState?.state !== LocalFileState.ERROR ? (
          <Button className="" variant="outline">
            View
          </Button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default function ModelUpload({
  files,
  fileStates,
  setFiles,
  className,
}: {
  files: FileList | null;
  fileStates: FileNameState[];
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
  className?: string;
}) {
  const addFile = (file: File) => {
    setFiles((prevFiles: FileList | null) => {
      const dataTransfer = new DataTransfer();
      if (prevFiles) {
        Array.from(prevFiles).forEach((f) => dataTransfer.items.add(f));
      }
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });
  };

  const removeFile = (file: File) => {
    setFiles((prevFiles: FileList | null) => {
      if (prevFiles) {
        const dataTransfer = new DataTransfer();
        Array.from(prevFiles).forEach((f) => {
          if (f !== file) {
            dataTransfer.items.add(f);
          }
        });
        return dataTransfer.files;
      }
      return new FileList();
    });
  };
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => addFile(file));
    }
  };

  useEffect(() => {
    console.log("fileStates upload", fileStates);
  }, [fileStates]);

  return (
    <div className={cn("w-full mx-auto ", className)}>
      <div className="rounded mb-6 ">
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center relative hover:opacity-80 cursor-pointer">
          {files && files.length > 0 ? (
            <div className="mt-4 text-left">
              {files &&
                Array.from(files).map((file: File) => (
                  <FileItem
                    key={file.name}
                    file={file}
                    fileNameState={fileStates.find(
                      (f) => f.fileName === file.name,
                    )}
                    onRemove={() => {
                      removeFile(file);
                    }}
                  />
                ))}
              <div className="relative">
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach((file) =>
                        addFile(file),
                      );
                    }
                  }}
                  title="Add more files"
                  className="absolute w-full h-full custom-file-input"
                />
                <div className=" flex items-center justify-center mt-6">
                  <Button variant="secondary" className="mt-2 px-6 text-md">
                    <Plus size={16} className="mr-1" /> Add More Files
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-lg text-gray-600">
                Drag and drop your files here
              </p>
              <input
                type="file"
                multiple
                onChange={(e) => handleInput(e)}
                title="Upload your files"
                className="absolute w-full h-full custom-file-input opacity-0"
                name="attachmentFiles"
              />
              <Button variant="secondary" className="mt-2 px-6 text-md">
                or select files
              </Button>
            </div>
          )}
        </div>
        {/* <Alert className=" mx-auto mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supported Formats</AlertTitle>
          <AlertDescription>
            We accept pitch deck files in .pdf format. Total upload size limit:
            50MB
          </AlertDescription>
        </Alert> */}
        <div className=" px-6 py-2">
          <ul className="list-disc ">
            <li>
              Supported formats:
              <span className="text-gray-500 font-normal">
                {" "}
                pdf, docx, doc, pptx, ppt
              </span>
            </li>
            <li>
              Maximum number of files:
              <span className="text-gray-500 font-normal"> 10</span>
            </li>
            <li>
              Maximum file size:
              <span className="text-gray-500 font-normal"> 50MB</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
