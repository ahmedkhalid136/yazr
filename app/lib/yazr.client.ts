import { FileStatus, ProcessingStatus } from "./types";
import { FileType } from "./types";
import { nanoid } from "nanoid";
import { folders } from "./utils";
import { sha1 } from "hash-wasm";

export type FilesAnalyseData = {
  userId: string;
  folderId: string;
  fileUrls: string[];
  workspaceId: string;
  creator: {
    email: string;
    name: string;
    surname: string;
  };
  hashs: string[];
};

export type EmailAnalyseData = {
  email: string;
  subject: string;
  body: string;
  attachments: string[];
  id: string;
  userId: string;
  workspaceId: string;
};

const yazrClient = {
  analyseEmail: async ({
    attachments,
    id,
    email,
    workspaceId,
    userId,
    subject,
    body,
  }: EmailAnalyseData) => {
    const formData: EmailAnalyseData = {
      email,
      subject,
      body,
      attachments,
      id,
      workspaceId,
      userId,
    };

    const res = await fetch("/api/doc/upload/form", {
      method: "post",
      body: JSON.stringify(formData),
    });
    return res;
  },
  uploadFileToS3: async (file: File, folderId: string): Promise<string> => {
    try {
      const fileUrl =
        folderId + file.name.replace(/\s+/g, "-").replace(/[^\w\.-]/g, "");
      // 1. Get pre-signed URL
      const response = await fetch("/api/doc/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: fileUrl,
          contentType: file.type,
        }),
      });

      const signedUrl = await response.json();

      console.log("signedUrl", signedUrl);
      // 2. Upload directly to S3

      await fetch(signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      return fileUrl;
    } catch (error) {
      console.error("error in uploadFileToS3", error);
      throw error;
    }
  },
  hashFile: async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hash = await sha1(new Uint8Array(buffer));
    return hash;
  },
  uploadFileAndBuildProfile: async (
    file: File,
    jobId: string,
    workspaceId: string,
    userId: string,
    businessId: string,
    category: string = "other",
  ): Promise<string> => {
    const folder = folders.rawFiles({
      workspaceId,
      jobId,
    });
    const fileSignature = await yazrClient.hashFile(file);
    // const fileExists = await fetch(
    //   `/api/doc/upload/fileExist/${fileSignature}`,
    // );
    // const fileExistsData = await fileExists.json();
    // console.log("fileExists", fileExistsData);

    // if (fileExistsData.exists) {
    //   return fileExistsData.file.fileId;
    // }
    const fileUrl = await yazrClient.uploadFileToS3(file, folder);
    if (!fileUrl) {
      throw new Error("File not uploaded");
    }

    const fProfile: FileType = {
      fileId: nanoid(),
      fileUrl: fileUrl,
      workspaceId: workspaceId,
      businessId: businessId,
      category,
      jobId: jobId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadDate: new Date().toISOString(),
      retryCount: 0,
      fileName: fileUrl.split("/").pop()?.split(".")[0] as string,
      userId: userId as string,
      fileFormat: fileUrl.split(".").pop()?.toLowerCase() as string,
      from: userId,
      status: FileStatus.PENDING,
      processPhase: ProcessingStatus.FILE_UPLOAD_START,
      fileSignature: fileSignature,
    };

    const result = await fetch("/api/doc/upload/fileProfile", {
      method: "post",
      body: JSON.stringify(fProfile),
    });

    if (!result.ok) {
      throw new Error("File profile not created");
    }
    console.log("file uploaded with success:", fProfile);

    return fProfile.fileId;
  },
  file: {
    delete: async (fileId: string) => {
      const res = await fetch(`/api/doc/delete/file/${fileId}`, {
        method: "GET",
      });
      return res.json();
    },
  },
};

export default yazrClient;
