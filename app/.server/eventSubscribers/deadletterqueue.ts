import { sendEmail } from "@/lib/email.server";
import { SQSEvent } from "aws-lambda";

export const handler = async (event: SQSEvent) => {
  console.log("Dead Letter Queue event", event);
  await sendEmail(
    "alfredo@yazr.ai",
    `Dead Letter Queue event`,
    JSON.stringify(event),
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Email sent successfully",
    }),
  };
};

const t = {
  Records: [
    {
      messageId: "0a5b128a-8e1b-4f7f-a96e-42f24845fa4b",
      receiptHandle:
        "AQEBoYaPc3Xlb1hyNAkE/aW4oNHnKrG3Gwnp6TkYwDFJ4EO+7HHatoVkdSTKXwoTnL0RIs5UmXLTU+KbHT3ykwREbzfqJOgeZqPWQUaU06glwPexHaSpQHkqtTOAM7SUI43/649ZKKhpFFpBE0CRF8ySkkNBAQsihbClxah9mPNHIawZAztMFc4JGT02dcBvbDNZlZ4UsXWA+qEdPqnLN3LSzpwX2UIud8cgQ9nJU+4Oo9VsnnIWM0oj5deCoEzGUml8K5mIiMwhfpxsjN/HsBSYenWRZWRyXbkikoPhnsteGhKaBktJUrKiRWMnIxx4VxpgaWmxESVYbzkiB0OBg4U3ZPzn06zz9Yo6ddiZYCv6A3Fm8inh4tQoOsCLPKbRApO3tEslHm2rmZ0j+++OtLIuWw==",
      body: '{"type":"job","id":"91aba5a0-4f22-4e3a-a3d1-8eec949089ba","nextStep":"job_file_sequencer"}',
      attributes: {
        DeadLetterQueueSourceArn:
          "arn:aws:sqs:us-east-1:555936009989:ai-prod-DataProcessingQueueQueue",
        ApproximateReceiveCount: "2",
        AWSTraceHeader:
          "Root=1-67bee08f-c748b9f7d989b9e02418cb55;Parent=4307a2b3f6f828c5;Sampled=0;Lineage=1:bedf2eab:0",
        SentTimestamp: "1740562576005",
        SenderId:
          "AROAYC4C6J4C7OXER37HW:ai-prod-JobsSubscriberjobSubscriberFunctionFunction",
        ApproximateFirstReceiveTimestamp: "1740562576013",
      },
      messageAttributes: {},
      md5OfBody: "b889ea441d6d013795bcc134907c6c21",
      eventSource: "aws:sqs",
      eventSourceARN:
        "arn:aws:sqs:us-east-1:555936009989:ai-prod-DeadLetterQueueQueue",
      awsRegion: "us-east-1",
    },
  ],
};
