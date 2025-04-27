import { createClient } from "@openauthjs/openauth/client";
import { Resource } from "sst";

export const client = createClient({
  clientID: "yazrAI",
  issuer: Resource.Auth.url,
});
