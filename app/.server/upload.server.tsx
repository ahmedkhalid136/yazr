import type { UploadHandlerPart } from "@remix-run/node";
import s3 from "@/.server/s3.server";

export const s3UploaderHandler: <T extends UploadHandlerPart>(
  props: T,
  folderId: string,
  folder: "attachments",
) => Promise<string> = async (props, folderId, folder) => {
  const { filename, data, contentType } = props;
  console.log("s3UploaderHandler", filename, data, contentType);
  // If it is not a file, handle it
  if (!filename || !data || !contentType) {
    const chunks: Uint8Array[] = [];
    for await (const chunk of data) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);
    return buffer.toString();
  }
  console.log("s3UploaderHandler file", filename, data, contentType);
  // If it is a file, upload to S3
  let s3FileName = "";
  switch (folder) {
    case "attachments":
      s3FileName = `attachments/${folderId}/${filename}`;
      await s3.docStoring.upload(data, s3FileName, contentType);
      return JSON.stringify({ fileUrl: s3FileName });
  }

  // Optional: Throw an error if folder is somehow not matched
  throw new Error(`Unsupported folder type: ${folder}`);
};

export const externalLinkUploader = async (
  datasetUrl: string,
  datasetId: string,
) => {
  const url = new URL(datasetUrl as string);
  const response = await fetch(url);
  const blob = await response.blob();
  const reader = blob.stream().getReader();
  const asyncIterable = {
    async *[Symbol.asyncIterator]() {
      let result;
      while (!(result = await reader.read()).done) {
        yield result.value;
      }
    },
  };
  const s3FileName = `datasetFile-${datasetId}.zip`;
  const s3Url = await s3.docStoring.upload(
    asyncIterable,
    s3FileName,
    "application/zip",
  );

  return s3Url;
};
