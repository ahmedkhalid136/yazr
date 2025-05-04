// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.sst/platform/config.d.ts" />

export default function AuthStack({
  dbUser,
  dbWorkspace,
  dbEmail,
  dbJobs,
  dbBusinesses,
  dbCall,
  dbFileEntities,
  dbCrustdata,
  dbTemplates,
  dbCrustdataFounders,
  dbProfiles,
}: {
  dbUser: sst.aws.Dynamo;
  dbWorkspace: sst.aws.Dynamo;
  dbEmail: sst.aws.Dynamo;
  dbJobs: sst.aws.Dynamo;
  dbBusinesses: sst.aws.Dynamo;
  dbCall: sst.aws.Dynamo;
  dbFileEntities: sst.aws.Dynamo;
  dbCrustdata: sst.aws.Dynamo;
  dbCrustdataFounders: sst.aws.Dynamo;
  dbTemplates: sst.aws.Dynamo;
  dbProfiles: sst.aws.Dynamo;
}) {
  const authTable = new sst.aws.Dynamo("AuthDb", {
    fields: {
      pk: "string",
      sk: "string",
    },
    ttl: "expiry",
    primaryIndex: {
      hashKey: "pk",
      rangeKey: "sk",
    },
  });

  const authEmail = new sst.aws.Email("AuthEmail", {
    sender: $app.stage === "prod" ? "yazr.ai" : "noreply+dev2@yazr.ai",
    dmarc:
      $app.stage === "prod"
        ? "v=DMARC1; p=quarantine; adkim=s; aspf=s;"
        : undefined,
    dns: $app.stage === "prod" ? sst.cloudflare.dns() : undefined,
  });
  const auth = new sst.aws.Auth("Auth", {
    forceUpgrade: "v2",
    issuer: {
      handler: "backend/auth/authorizer.handler",
      link: [
        authTable,
        authEmail,
        dbUser,
        dbWorkspace,
        dbEmail,
        dbJobs,
        dbBusinesses,
        dbCall,
        dbFileEntities,
        dbCrustdata,
        dbCrustdataFounders,
        dbTemplates,
        dbProfiles,
      ],
    },
    domain:
      $app.stage === "prod"
        ? {
            name: "auth.yazr.ai",
            dns: sst.cloudflare.dns(),
          }
        : undefined,
  });
  return {
    auth,
  };
}
