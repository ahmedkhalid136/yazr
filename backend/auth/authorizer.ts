import { issuer } from "@openauthjs/openauth";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { DynamoStorage } from "@openauthjs/openauth/storage/dynamo";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { handle } from "hono/aws-lambda";
import { subjects } from "./subjects.js";
import { Resource } from "sst";
import { sendEmail } from "./emailCode.js";
import yazrServer from "@/lib/yazr.server";
// async function getUser(email?: string): Promise<string> {
// Get user from database
// Return user ID
// return "123";
// }

const allowedEmails = [
  "laura@yazr.ai",
  "alfredo@yazr.ai",
  "laura.ruslanova@gmail.com",
  "a.belfiori@gmail.com",
];

const app = issuer({
  storage: DynamoStorage({
    table: Resource.AuthDb.name,
  }),
  subjects,
  providers: {
    password: PasswordProvider(
      PasswordUI({
        sendCode: async (email: string, code: string) => {
          console.log(email, code);
          if (!(allowedEmails.includes(email) || email.includes("@blackfin"))) {
            throw new Error(`Not allowed email: ${email}`);
          }

          try {
            await sendEmail(email, code);
          } catch (error) {
            console.error("Error sending email", error);
          }
        },
      }),
    ),
  },
  success: async (ctx, value) => {
    if (value.provider === "password") {
      console.log("value in success", value);
      console.log(
        "ctx",
        ctx.subject("user", {
          email: value.email,
          // id: await getUser(value.email),
        }),
      );
      const user = await yazrServer.user.getByEmail({ email: value.email });
      if (!user) {
        console.log("user not found, gotta add it to the database");
        const userId = crypto.randomUUID();
        const workspaceId = "temp";
        await yazrServer.user.create({
          email: value.email,
          name: "",
          surname: "",
          companyName: "",
          workspaceId: workspaceId,
        });
      }
      return ctx.subject("user", {
        email: value.email,
        // id: await getUser(value.email),
      });
    }
    throw new Error("Invalid provider");
  },
  theme: {
    title: "Yazr AI | Login",
    primary: {
      light: "#000",
      dark: "#fff",
    },
    logo: {
      light: "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/Yazr.png",
      dark: "https://randompublicalfredo.s3.eu-west-2.amazonaws.com/Yazr_white.png",
    },
  },
});

export const handler = handle(app);

// export const handler = (event: any) => {
//   console.log(event);
//   return {
//     statusCode: 200,
//     body: "Hello World",
//   };
// };
