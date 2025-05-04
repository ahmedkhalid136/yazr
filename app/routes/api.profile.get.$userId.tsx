import db from "@/lib/db.server_dep";
import { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  try {
    const { userId } = params;
    console.log("userId", userId);
    const userProfile = await db.user.get(userId as string);
    console.log("userProfile", userProfile);
    if (!userProfile) {
      return Response.json(null);
    }
    return Response.json(userProfile);
  } catch (error) {
    return Response.json({ status: "failed" });
  }
};
