import type {
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  ListObjectsV2CommandInput,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";
import { Readable } from "stream";

const s3Client = new S3Client({ region: "us-east-1" });

const uploadStreamToS3 = async (
  data: AsyncIterable<Uint8Array>,
  key: string,
  contentType: string,
  bucketName: string,
) => {
  const BUCKET_NAME = bucketName;

  const params: PutObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: await convertToBuffer(data),
    ContentType: contentType,
  };

  const response = await s3Client.send(new PutObjectCommand(params));
  // console.log("response", response);

  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    }),
    { expiresIn: 15 * 60 },
  );
  if (!url) {
    throw new Error("Failed to get signed url");
  }
  return url;
};

const getBufferFromS3 = async (
  key: string,
  bucketName: string,
): Promise<Buffer> => {
  const BUCKET_NAME = bucketName;
  const params: GetObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  const data = await s3Client.send(new GetObjectCommand(params));
  // Read the stream completely
  const stream = data.Body as Readable;
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  const fileContent = Buffer.concat(chunks);

  return fileContent;
};

const getStreamFromS3 = async (
  key: string,
  bucketName: string,
): Promise<Readable> => {
  const BUCKET_NAME = bucketName;
  const params: GetObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  const data = await s3Client.send(new GetObjectCommand(params));
  // Read the stream completely
  const stream = data.Body as Readable;

  return stream;
};

const getSize = async (key: string, bucketName: string) => {
  const BUCKET_NAME = bucketName;
  const params: GetObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  const data = await s3Client.send(new GetObjectCommand(params));
  return data;
};
// The UploadHandler gives us an AsyncIterable<Uint8Array>, so we need to convert that to something the aws-sdk can use.
// Here, we are going to convert that to a buffer to be consumed by the aws-sdk.
async function convertToBuffer(a: AsyncIterable<Uint8Array>) {
  const result = [];
  for await (const chunk of a) {
    result.push(chunk);
  }
  return Buffer.concat(result);
}

const deleteObjectFromS3 = async (key: string, bucketName: string) => {
  const BUCKET_NAME = bucketName;
  const params: DeleteObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  try {
    const response = await s3Client.send(new DeleteObjectCommand(params));
    console.log("response", key, response);
  } catch (error) {
    console.error("Error deleting object from S3", error);
    return { isSuccess: false, msg: "error" };
  }
  return { isSuccess: true, msg: "deleted" };
};

async function* stringToAsyncIterable(
  str: string,
  chunkSize: number = 64 * 1024,
): AsyncIterable<Uint8Array> {
  const encoder = new TextEncoder();
  const uint8array = encoder.encode(str);
  for (let i = 0; i < uint8array.length; i += chunkSize) {
    yield uint8array.subarray(i, i + chunkSize);
  }
}

const listObjectsInFolder = async (
  bucketName: string,
  folderName: string,
): Promise<string[]> => {
  const params: ListObjectsV2CommandInput = {
    Bucket: bucketName,
    Prefix: folderName.endsWith("/") ? folderName : `${folderName}/`,
    Delimiter: "/", // Optional: Use delimiter to group by folders
  };

  try {
    const command = new ListObjectsV2Command(params);
    const response = await s3Client.send(command);

    if (!response.Contents) {
      return [];
    }

    // Filter out the folder itself if it's included in the results
    const objectKeys = response.Contents.map((object) => object.Key!).filter(
      (key) => key !== folderName,
    );

    return objectKeys;
  } catch (error) {
    console.error("Error listing objects in folder:", error);
    throw error;
  }
};

const s3 = {
  docStoring: {
    upload: (
      data: AsyncIterable<Uint8Array>,
      key: string,
      contentType: string,
    ) => uploadStreamToS3(data, key, contentType, Resource.DocStoring.name),
    get: (key: string) => getBufferFromS3(key, Resource.DocStoring.name),
    getStream: (key: string) => getStreamFromS3(key, Resource.DocStoring.name),
    getSize: (key: string) => getSize(key, Resource.DocStoring.name),
    delete: (key: string) => deleteObjectFromS3(key, Resource.DocStoring.name),
    list: (folder: string) =>
      listObjectsInFolder(Resource.DocStoring.name, folder),
    getSignedUrl: (key: string, fileType: string) =>
      getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: Resource.DocStoring.name,
          Key: key,
          ContentType: fileType,
        }),
        { expiresIn: 60 * 60 * 24 },
      ),
  },
  crustdata: {
    upload: (
      data: AsyncIterable<Uint8Array>,
      key: string,
      contentType: string,
    ) =>
      uploadStreamToS3(data, key, contentType, Resource.CrustdataStoring.name),
    get: (key: string) => getBufferFromS3(key, Resource.CrustdataStoring.name),
    getStream: (key: string) =>
      getStreamFromS3(key, Resource.CrustdataStoring.name),
    getSize: (key: string) => getSize(key, Resource.CrustdataStoring.name),
    delete: (key: string) =>
      deleteObjectFromS3(key, Resource.CrustdataStoring.name),
    list: (folder: string) =>
      listObjectsInFolder(Resource.CrustdataStoring.name, folder),
    getSignedUrl: (key: string, fileType: string) =>
      getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: Resource.CrustdataStoring.name,
          Key: key,
          ContentType: fileType,
        }),
        { expiresIn: 60 * 60 * 24 },
      ),
  },

  emailStoring: {
    upload: (
      data: AsyncIterable<Uint8Array>,
      key: string,
      contentType: string,
    ) => uploadStreamToS3(data, key, contentType, Resource.EmailBucket.name),
    get: (key: string) => getBufferFromS3(key, Resource.EmailBucket.name),
    getStream: (key: string) => getStreamFromS3(key, Resource.EmailBucket.name),
    getSize: (key: string) => getSize(key, Resource.EmailBucket.name),
    delete: (key: string) => deleteObjectFromS3(key, Resource.EmailBucket.name),
    list: (folder: string) =>
      listObjectsInFolder(Resource.EmailBucket.name, folder),
    getSignedUrl: (key: string, fileType: string) =>
      getSignedUrl(
        s3Client,
        new PutObjectCommand({
          Bucket: Resource.EmailBucket.name,
          Key: key,
          ContentType: fileType,
        }),
        { expiresIn: 60 * 60 * 24 },
      ),
  },
  lib: {
    stringToAsyncIterable: (str: string) => stringToAsyncIterable(str),
  },
};

export default s3;
