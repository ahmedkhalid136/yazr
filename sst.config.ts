// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "yazr",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      profile: "yazr",
      providers: { aws: "6.66.2" },
      region: "us-east-1",
      protect: ["production", "prod"].includes(input?.stage),
    };
  },
  async run() {
    const AuthStack = await import("./stacks/AuthStack");
    const DbStack = await import("./stacks/DbStack");
    const {
      dbEmail,
      dbTemplates,
      dbJobs,
      dbBusinesses,
      dbCall,
      dbFileEntities,
      dbCrustdata,
      dbCrustdataFounders,
      dbWorkspace,
      dbUser,
    } = DbStack.default();
    const { auth } = AuthStack.default({
      dbUser,
      dbWorkspace,
      dbEmail,
      dbJobs,
      dbTemplates,
      dbBusinesses,
      dbCall,
      dbFileEntities,
      dbCrustdata,
      dbCrustdataFounders,
    });
    const bucketDocStoring = new sst.aws.Bucket("DocStoring");
    const bucketCrustdata = new sst.aws.Bucket("CrustdataStoring");

    const GEMINI_SECRET = new sst.Secret(
      "GEMINI_SECRET",
      process.env.GEMINI_API_KEY ?? "",
    );
    const ANTHROPIC_SECRET = new sst.Secret(
      "ANTHROPIC_SECRET",
      process.env.ANTHROPIC_API_KEY ?? "",
    );
    const OPENAI_SECRET = new sst.Secret(
      "OPENAI_SECRET",
      process.env.OPENAI_API_KEY ?? "",
    );
    const POSTMARK_SECRET = new sst.Secret(
      "POSTMARK_SECRET",
      process.env.POSTMARK_API_KEY ?? "",
    );
    const PERPLEXITY_SECRET = new sst.Secret(
      "PERPLEXITY_SECRET",
      process.env.PERPLEXITY_API_KEY ?? "",
    );
    const CRUSTDATA_SECRET = new sst.Secret(
      "CRUSTDATA_SECRET",
      process.env.CRUSTDATA_API_KEY ?? "",
    );
    const OPENAI_ORG_SECRET = new sst.Secret(
      "OPENAI_ORG_SECRET",
      process.env.OPENAI_ORG ?? "",
    );
    const OPENAI_PROJECT_SECRET = new sst.Secret(
      "OPENAI_PROJECT_SECRET",
      process.env.OPENAI_PROJECT ?? "",
    );

    const secretDynameHashUUID = new sst.Secret(
      "DynameHashUUID",
      "5c9f261e-4884-4fcb-ab55-5c72f1033e85",
    );

    const web = new sst.aws.Remix("Yazr", {
      link: [
        bucketCrustdata,
        bucketDocStoring,
        dbEmail,
        dbJobs,
        dbWorkspace,
        dbUser,
        dbBusinesses,
        dbCall,
        // pdfCreator,
        dbCrustdata,
        auth,
        dbFileEntities,
        dbCrustdataFounders,
        dbTemplates,
        GEMINI_SECRET,
        ANTHROPIC_SECRET,
        OPENAI_SECRET,
        POSTMARK_SECRET,
        PERPLEXITY_SECRET,
        CRUSTDATA_SECRET,
        OPENAI_ORG_SECRET,
        OPENAI_PROJECT_SECRET,
      ],
      environment: {
        OPENAI_API_KEY: OPENAI_SECRET.value,
        OPENAI_ORG: OPENAI_ORG_SECRET.value,
        OPENAI_PROJECT: OPENAI_PROJECT_SECRET.value,
        CRUSTDATA_API_KEY: CRUSTDATA_SECRET.value,
        EMAIL_SEED: secretDynameHashUUID.value,
        OPENAUTH_ISSUER: auth.url,
        PERPLEXITY_API_KEY: PERPLEXITY_SECRET.value,
        GEMINI_API_KEY: GEMINI_SECRET.value,
        // PDF_CREATOR_URL: pdfCreator.url,
        DEV: $app.stage === "prod" ? "false" : "true",
      },
    });

    return {
      web: web.url,
      auth: auth.url,
      region: $app?.providers?.aws?.region,
    };
  },
});
