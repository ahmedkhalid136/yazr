import { Resource } from "sst";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const client = new SESv2Client();

export const sendEmail = async (email: string, code: string) => {
  await client.send(
    new SendEmailCommand({
      FromEmailAddress: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        Resource.AuthEmail.sender
      )
        ? Resource.AuthEmail.sender
        : "noreply@yazr.ai",
      Destination: {
        ToAddresses: [email],
      },
      Content: {
        Simple: {
          Subject: {
            Data: "Yazr AI | Confirmation code",
          },
          Body: {
            Text: {
              Data: `Your confirmation code is ${code}`,
            },
          },
        },
      },
    })
  );

  return {
    statusCode: 200,
    body: "Sent!",
  };
};
