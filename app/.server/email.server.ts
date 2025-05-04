import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const client = new SESv2Client();

// import {ServerClient} from "postmark";

// Example request
// const client = new ServerClient(process.env.POSTMARK_API_KEY!);

export const sendEmail = async (
  emailTo: string,
  subject: string,
  body: string,
) => {
  console.log("sending email to", emailTo);

  // client.sendEmail({
  //     "From": "onepager@doc.yazr.ai",
  //     "To": emailTo,
  //     "Subject": subject,
  //     "TextBody": body
  // });

  await client.send(
    new SendEmailCommand({
      FromEmailAddress: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        Resource.DocEmail.sender,
      )
        ? Resource.DocEmail.sender
        : "noreply@yazr.ai",
      Destination: {
        ToAddresses: [emailTo],
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
          },
          Body: {
            Html: {
              Data: body,
            },
          },
        },
      },
    }),
  );
  console.log("email sent to", emailTo);

  return {
    statusCode: 200,
    body: "Sent!",
  };
};
