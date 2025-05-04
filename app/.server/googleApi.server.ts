// import s3 from "@/lib/s3";
// import { drive } from "@/lib/google";

// export const listFiles = async () => {
//   const response = await drive.files.list({
//     pageSize: 10,
//     fields: "nextPageToken, files(id, name)",
//   });
//   return response.data;
// };

// export const uploadFile = async (file: File) => {
//   const response = await drive.files.create({
//     requestBody: {
//       name: file.name,
//       mimeType: file.type,
//     },
//     media: {
//       mimeType: file.type,
//       body: file.stream(),
//     },
//   });
//   return response.data;
// };

// export const accessFile = async (fileId: string) => {
//   const response = await drive.files.get({
//     fileId,
//   });
//   return response.data;
// };

// export const deleteFile = async (fileId: string) => {
//   const response = await drive.files.delete({
//     fileId,
//   });
//   return response.data;
// };

// export const updateFile = async (fileId: string, file: File) => {
//   const response = await drive.files.update({
//     fileId,
//     media: {
//       mimeType: file.type,
//       body: file.stream(),
//     },
//   });
//   return response.data;
// };

// export const getUrl = async (fileId: string) => {
//   const response = await drive.files.get({
//     fileId,
//     fields: "webViewLink",
//   });
//   return response.data;
// };

// // Function to upload a file to Google Drive
// export async function uploadFileFromS3(s3Path: string) {
//   try {
//     if (!s3Path.split("/").pop()) {
//       throw new Error("Invalid S3 path");
//     }
//     const fileName = s3Path.split("/").pop()!;

//     const fileMetadata = { name: fileName, fields: "id" };
//     const file = await s3.models.getStream(s3Path);
//     const mimeType = "application/x-ipynb+json";
//     const media = { mimeType: mimeType, body: file };

//     const response = await drive.files.create({
//       requestBody: fileMetadata,
//       media: media,
//       fields: "id",
//     });
//     // console.log("response", response);
//     const permissions = {
//       type: "user",
//       role: "writer",
//       emailAddress: "a.belfiori@gmail.com",
//     };
//     if (!response.data.id) {
//       throw new Error("Error uploading file to Google Drive");
//     }

//     const permissionResponse = await drive.permissions.create({
//       requestBody: permissions,
//       fileId: response.data.id,
//       fields: "id",
//     });
//     if (permissionResponse.status !== 200) {
//       throw new Error("Error setting permissions on Google Drive");
//     }
//     return response.data.id;
//   } catch (error) {
//     console.error(
//       "Error uploading file to Google Drive:",
//       (error as Error).message || error
//     );
//     throw error;
//   }
// }
