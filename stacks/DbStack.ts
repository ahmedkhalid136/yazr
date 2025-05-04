// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.sst/platform/config.d.ts" />

export default function DbStack() {
  const dbUser = new sst.aws.Dynamo("UserDb", {
    fields: {
      PK: "string",
      email: "string",
      constIndex: "string",
      workspaceId: "string",
    },
    primaryIndex: {
      hashKey: "PK",
    },
    globalIndexes: {
      EmailIndex: {
        hashKey: "email",
        projection: "all",
      },
      WorkspaceIndex: {
        hashKey: "workspaceId",
        projection: "all",
      },
      ConstIndex: {
        hashKey: "constIndex",
        projection: "keys-only",
      },
    },
  });

  const dbWorkspace = new sst.aws.Dynamo("WorkspaceDb", {
    fields: {
      PK: "string",
      constIndex: "string",
    },
    primaryIndex: {
      hashKey: "PK",
    },
    globalIndexes: {
      ConstIndex: {
        hashKey: "constIndex",
        projection: ["PK", "name"],
      },
    },
  });

  const dbEmail = new sst.aws.Dynamo("EmailTable", {
    fields: {
      email: "string",
      id: "string",
      constIndex: "string",
    },
    primaryIndex: {
      hashKey: "id",
    },
    globalIndexes: {
      CreatedAtIndex: {
        hashKey: "email",
      },
      EmailIndex: {
        hashKey: "email",
      },
      ConstIndex: {
        hashKey: "constIndex",
      },
    },
  });
  const dbJobs = new sst.aws.Dynamo("Jobs", {
    fields: {
      emailId: "string",
      jobId: "string",
      workspaceId: "string",
      createdAt: "string",
      status: "string",
    },
    primaryIndex: {
      hashKey: "workspaceId",
      rangeKey: "createdAt",
    },
    globalIndexes: {
      EmailIndex: {
        hashKey: "emailId",
      },
      jobIdIndex: {
        hashKey: "jobId",
      },
      statusIndex: {
        hashKey: "status",
      },
    },
    stream: "keys-only",
  });
  const dbBusinesses = new sst.aws.Dynamo("Businesses", {
    fields: {
      profileId: "string",
      constIndex: "string",
      workspaceId: "string",
      businessId: "string",
    },
    primaryIndex: {
      hashKey: "profileId",
    },
    globalIndexes: {
      ConstIndex: {
        hashKey: "constIndex",
      },
      WorkspaceIndex: {
        hashKey: "workspaceId",
      },
      BusinessIdIndex: {
        hashKey: "businessId",
      },
    },
  });
  const dbCall = new sst.aws.Dynamo("Call", {
    fields: {
      callId: "string",
      businessId: "string",
    },
    primaryIndex: {
      hashKey: "callId",
    },
    globalIndexes: {
      BusinessIndex: {
        hashKey: "businessId",
      },
    },
  });
  const dbFileEntities = new sst.aws.Dynamo("FileEntities", {
    fields: {
      fileId: "string",
      businessId: "string",
      jobId: "string",
      workspaceId: "string",
      fileSignature: "string",
      companyId: "string",
      status: "string",
    },
    primaryIndex: {
      hashKey: "fileId",
    },
    globalIndexes: {
      JobIndex: {
        hashKey: "jobId",
      },
      WorkspaceIndex: {
        hashKey: "workspaceId",
      },
      CompanyIndex: {
        hashKey: "companyId",
      },
      FileSignatureIndex: {
        hashKey: "fileSignature",
      },
      StatusIndex: {
        hashKey: "status",
      },
      BusinessIndex: {
        hashKey: "businessId",
      },
    },
    stream: "keys-only",
  });
  const dbCrustdata = new sst.aws.Dynamo("Crustdata", {
    fields: {
      domain: "string",
      createdAt: "string",
    },
    primaryIndex: {
      hashKey: "domain",
      rangeKey: "createdAt",
    },
    globalIndexes: {
      domainIndex: {
        hashKey: "domain",
      },
    },
  });
  const dbCrustdataFounders = new sst.aws.Dynamo("CrustdataFounders", {
    fields: {
      domain: "string",
      createdAt: "string",
    },
    primaryIndex: {
      hashKey: "domain",
      rangeKey: "createdAt",
    },
    globalIndexes: {
      domainIndex: {
        hashKey: "domain",
      },
    },
  });

  const dbTemplates = new sst.aws.Dynamo("Templates", {
    fields: {
      templateId: "string",
      workspaceId: "string",
    },
    primaryIndex: {
      hashKey: "workspaceId",
    },
    globalIndexes: {
      TemplateIdIndex: {
        hashKey: "templateId",
      },
    },
  });

  return {
    dbTemplates,
    dbUser,
    dbWorkspace,
    dbEmail,
    dbJobs,
    dbBusinesses,
    dbCall,
    dbFileEntities,
    dbCrustdata,
    dbCrustdataFounders,
  };
}
