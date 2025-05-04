// import { Resource } from "sst";
// import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

// const client = new SESv2Client();

// export default async function sendEmail(
//   to: string,
//   subject: string,
//   body: string
// ) {
//   await client.send(
//     new SendEmailCommand({
//       FromEmailAddress: Resource.EmailService.sender,
//       Destination: {
//         ToAddresses: [to],
//       },
//       Content: {
//         Simple: {
//           Subject: { Data: subject },
//           Body: { Text: { Data: body } },
//         },
//       },
//     })
//   );
// }
