import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Upload, {
  LocalFileState,
  FileNameState,
  validFileTypes,
  getFileExtension,
} from "@/components/Upload";
import { v4 as uuidv4 } from "uuid";
import yazrClient from "@/lib/yazr.client";
import { useNavigate } from "@remix-run/react";

async function uploadFileToS3(
  file: File,
  jobId: string,
  workspaceId: string,
  userId: string,
  businessId: string,
): Promise<FileNameState> {
  console.log(file);
  const fileId = await yazrClient.uploadFileAndBuildProfile(
    file,
    jobId,
    workspaceId,
    userId,
    businessId,
  );

  return {
    fileName: file.name,
    state: LocalFileState.UPLOADED,
    text: "Success",
    fileId,
    category: "other",
  };
}

// Get file state for newly added file (before uploading to server)
function getNewFileState(file: File): FileNameState {
  const state = {
    fileName: file.name,
    state: "uploading",
    text: "Pending",
  };

  if (file.size > 50 * 1024 * 1024) {
    state.state = LocalFileState.ERROR;
    state.text = "Failed: Max size exceeded";
  } else if (
    !validFileTypes.includes(
      file.name.split(".").pop()?.toLowerCase() as string,
    )
  ) {
    state.state = LocalFileState.ERROR;
    state.text = "Failed: Unsupported file type";
  }

  return state as FileNameState;
}

export function BusinessFilesUploader({
  workspaceId,
  userId,
  businessId,
}: {
  workspaceId: string;
  userId: string;
  businessId: string;
}) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileStates, setFileStates] = useState<FileNameState[]>([]);
  const jobIdRef = useRef(uuidv4());
  const jobId = jobIdRef.current;
  const navigate = useNavigate();

  useEffect(() => {
    async function uploadNewFiles() {
      if (files === null) return;
      // Identify new file(s)
      const existingFiles = fileStates.filter((f) => f.fileName);
      const newFiles = [...files].filter(
        (f) => !existingFiles.map((i) => i.fileName).includes(f.name),
      );

      if (newFiles.length > 0) {
        // Add file to file states
        const newFileStates: FileNameState[] = [];
        newFiles.forEach((f) => {
          newFileStates.push(getNewFileState(f));
        });
        setFileStates([...fileStates, ...newFileStates]);

        // Only upload newly added files that are also valid (not in error state due to size or type)
        const newValidFiles = newFiles.filter((newFile) =>
          newFileStates
            .filter((i) => i.state !== LocalFileState.ERROR)
            .map((i) => i.fileName)
            .includes(newFile.name),
        );
        // Trigger upload
        const uploadedFileStates: FileNameState[] = [];
        for (const file of newValidFiles) {
          const uploadedFileState = await uploadFileToS3(
            file,
            jobId,
            workspaceId,
            userId,
            businessId,
          );
          uploadedFileStates.push(uploadedFileState);
        }
        // Update file state
        setFileStates((prevFileStates) => {
          return prevFileStates.map((f) => {
            const uploadedFileState = uploadedFileStates.find(
              (i) => i.fileName === f.fileName,
            );
            if (uploadedFileState) {
              return uploadedFileState;
            }
            return f;
          });
        });
      }
    }
    uploadNewFiles();
  }, [files]);

  useEffect(() => {
    // Set uploading status
    if (
      fileStates.filter((s) => s.state == "uploading").length > 0 &&
      !loading
    ) {
      setLoading(true);
    } else if (
      fileStates.filter((s) => s.state == "uploading").length === 0 &&
      loading
    ) {
      setLoading(false);
    }
  }, [fileStates]);

  const handleSubmitFiles = async () => {
    setLoading(true);
    console.log("handleSubmitFiles");
    await fetch("/api/doc/startjob/" + jobId, {
      method: "GET",
    });
    setFiles(null);
    setFileStates([]);
    setLoading(false);
    navigate(".", { replace: true });
  };

  return (
    <div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Upload New Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Upload files={files} fileStates={fileStates} setFiles={setFiles} />
          {files && files.length > 0 && (
            <div className="flex justify-end w-full">
              <Button
                type="button"
                disabled={loading || files === null || files.length < 1}
                className="w-full text-md"
                onClick={handleSubmitFiles}
              >
                {loading ? "Uploading..." : "Save"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
