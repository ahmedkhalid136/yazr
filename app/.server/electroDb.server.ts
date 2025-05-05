import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Entity } from "electrodb";
import { Resource } from "sst";

const client = new DynamoDBClient({});

const usersTable = Resource.UserDb.name;
const workspacesTable = Resource.WorkspaceDb.name;
const emailTable = Resource.EmailTable.name;
const jobsTable = Resource.Jobs.name;
const profilesTable = Resource.Profiles.name;
const businessesTable = Resource.Businesses.name;
const callTable = Resource.Call.name;
const fileEntitiesTable = Resource.FileEntities.name;
const crustdataTable = Resource.Crustdata.name;
const crustdataFoundersTable = Resource.CrustdataFounders.name;
const templatesTable = Resource.Templates.name;

export const users = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "users",
    },
    attributes: {
      PK: { type: "string", required: true },
      email: { type: "string", required: true },
      roles: { type: "list", items: { type: "string" }, required: false },
      createdAt: {
        type: "number",
        default: () => Date.now(),
        readOnly: true,
      },
      updatedAt: {
        type: "number",
        watch: "*",
        set: () => Date.now(),
        readOnly: true,
      },
      name: { type: "string", required: true },
      profileImageUrl: { type: "string", required: false },
      surname: { type: "string", required: true },
      companyName: { type: "string", required: true },
      workspaceId: { type: "string", required: true },
      constIndex: { type: "string", required: true, set: () => "constIndex" },
    },
    indexes: {
      primary: {
        pk: {
          field: "PK",
          composite: ["PK"],
        },
      },
      byEmail: {
        index: "EmailIndex",
        pk: {
          field: "email",
          composite: ["email"],
        },
      },
      byWorkspace: {
        index: "WorkspaceIndex",
        pk: {
          field: "workspaceId",
          composite: ["workspaceId"],
        },
        projection: "all",
      },
      byConstIndex: {
        index: "ConstIndex",
        pk: {
          field: "constIndex",
          composite: ["constIndex"],
        },
        projection: "keys",
      },
    },
  },
  {
    table: usersTable,
    client,
  },
);

export const workspaces = new Entity(
  {
    model: {
      entity: "workspace",
      version: "1",
      service: "workspaces",
    },
    attributes: {
      PK: { type: "string", required: true },
      createdAt: { type: "number", required: true },
      updatedAt: { type: "number", required: true },
      constIndex: { type: "string", required: true, set: () => "constIndex" },
      name: { type: "string", required: true },
    },
    indexes: {
      primary: {
        pk: {
          field: "PK",
          composite: ["PK"],
        },
      },
      byConstIndex: {
        index: "ConstIndex",
        pk: {
          field: "constIndex",
          composite: ["constIndex"],
        },
      },
    },
  },
  {
    table: workspacesTable,
    client,
  },
);

export const emails = new Entity(
  {
    model: {
      entity: "email",
      version: "1",
      service: "emails",
    },
    attributes: {
      id: { type: "string", required: true },
      email: { type: "string", required: true },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
        readOnly: true,
      },
      updatedAt: {
        type: "string",
        watch: "*",
        set: () => new Date().toISOString(),
        readOnly: true,
      },
      constIndex: { type: "string", required: true, set: () => "constIndex" },
    },
    indexes: {
      primary: {
        pk: { field: "id", composite: ["id"] },
      },
      byEmail: {
        index: "EmailIndex",
        pk: { field: "email", composite: ["email"] },
      },
      byCreatedAt: {
        index: "CreatedAtIndex",
        pk: { field: "email", composite: ["email"] },
      },
      byConstIndex: {
        index: "ConstIndex",
        pk: { field: "constIndex", composite: ["constIndex"] },
      },
    },
  },
  { table: emailTable, client },
);

export const jobs = new Entity(
  {
    model: {
      entity: "job",
      version: "1",
      service: "jobs",
    },
    attributes: {
      workspaceId: { type: "string", required: true },
      createdAt: { type: "string", required: true },
      jobId: { type: "string", required: true },
      emailId: { type: "string", required: true },
      status: { type: "string", required: true },
      updatedAt: {
        type: "string",
        watch: "*",
        set: () => new Date().toISOString(),
        readOnly: true,
      },
      fileUrls: { type: "list", items: { type: "string" }, required: false },
      type: { type: "string", required: false },
      businessProfileId: { type: "string", required: false },
      fileStatus: {
        type: "list",
        required: false,
        items: {
          type: "map",
          properties: {
            fileId: { type: "string", required: true },
            fileUrl: { type: "string", required: true },
            status: { type: "string", required: true },
          },
        },
      },
      userId: { type: "string", required: false },
      creator: {
        type: "map",
        required: false,
        properties: {
          email: { type: "string", required: true },
          name: { type: "string", required: true },
          surname: { type: "string", required: true },
        },
      },
      constIndex: { type: "string", required: false },
    },
    indexes: {
      primary: {
        pk: { field: "workspaceId", composite: ["workspaceId"] },
        sk: { field: "createdAt", composite: ["createdAt"] },
      },
      byEmail: {
        index: "EmailIndex",
        pk: { field: "emailId", composite: ["emailId"] },
      },
      byJobId: {
        index: "jobIdIndex",
        pk: { field: "jobId", composite: ["jobId"] },
      },
      byStatus: {
        index: "statusIndex",
        pk: { field: "status", composite: ["status"] },
      },
    },
  },
  { table: jobsTable, client },
);

export const templates = new Entity(
  {
    model: {
      entity: "template",
      version: "1",
      service: "templates",
    },
    attributes: {
      templateId: { type: "string", required: true },
      createdAt: { type: "string", required: true },
      updatedAt: { type: "string", required: true },
      workspaceId: { type: "string", required: true },
      title: { type: "string", required: true },
      industry: { type: "string", required: true },
      fields: {
        type: "list",
        required: true,
        items: {
          type: "map",
          required: true,
          properties: {
            value: { type: "string", required: true },
            prompt: { type: "string", required: true },
            proposeChange: { type: "string", required: true },
            editedAt: { type: "string", required: true },
            source: { type: "string", required: true },
            approvedBy: { type: "string", required: true },
            title: { type: "string", required: true },
            category: { type: "string", required: true },
          },
        },
      },
    },

    indexes: {
      primary: {
        pk: { field: "workspaceId", composite: ["workspaceId"] },
      },
      byTemplateId: {
        index: "TemplateIdIndex",
        pk: { field: "templateId", composite: ["templateId"] },
      },
    },
  },
  { table: templatesTable, client },
);

export const profiles = new Entity(
  {
    model: {
      entity: "business",
      version: "1",
      service: "businesses",
    },
    attributes: {
      profileId: { type: "string", required: true },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
        readOnly: true,
      },
      constIndex: { type: "string", required: true, set: () => "constIndex" },
      workspaceId: { type: "string", required: true },
      businessId: { type: "string", required: false },
      creator: {
        type: "map",
        required: true,
        properties: {
          email: { type: "string", required: true },
          userId: { type: "string", required: true },
        },
      },
      fields: {
        type: "list",
        required: true,
        items: {
          type: "map",
          required: true,
          properties: {
            value: { type: "string", required: true },
            prompt: { type: "string", required: true },
            proposeChange: { type: "string", required: true },
            editedAt: { type: "string", required: true },
            source: { type: "string", required: true },
            approvedBy: { type: "string", required: true },
            title: { type: "string", required: true },
            category: { type: "string", required: true },
            id: { type: "number", required: true },
          },
        },
      },
    },
    indexes: {
      primary: {
        pk: { field: "profileId", composite: ["profileId"] },
      },
      byConstIndex: {
        index: "ConstIndex",
        pk: { field: "constIndex", composite: ["constIndex"] },
      },
      byWorkspace: {
        index: "WorkspaceIndex",
        pk: { field: "workspaceId", composite: ["workspaceId"] },
        projection: "all",
      },
      byBusinessId: {
        index: "BusinessIdIndex",
        pk: { field: "businessId", composite: ["businessId"] },
        sk: { field: "createdAt", composite: ["createdAt"] },
      },
    },
  },
  { table: profilesTable, client },
);

export const businesses = new Entity(
  {
    model: {
      entity: "business",
      version: "1",
      service: "businesses",
    },
    attributes: {
      businessId: { type: "string", required: true },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
        readOnly: true,
      },
      updatedAt: {
        type: "string",
        watch: "*",
        set: () => new Date().toISOString(),
        readOnly: true,
      },
      constIndex: { type: "string", required: true, set: () => "constIndex" },
      workspaceId: { type: "string", required: true },
      domain: { type: "string", required: true },
      name: { type: "string", required: true },
      businessUrlSlug: { type: "string", required: false },
      hasPrivateProfile: { type: "boolean", required: false },
      hasWebProfile: { type: "boolean", required: false },
      creator: {
        type: "map",
        required: true,
        properties: {
          email: { type: "string", required: true },
          userId: { type: "string", required: true },
        },
      },
    },
    indexes: {
      primary: {
        pk: { field: "businessId", composite: ["businessId"] },
      },
      byConstIndex: {
        index: "ConstIndex",
        pk: { field: "constIndex", composite: ["constIndex"] },
      },
      byWorkspace: {
        index: "WorkspaceIndex",
        pk: { field: "workspaceId", composite: ["workspaceId"] },
        projection: "all",
      },
    },
  },
  { table: businessesTable, client },
);

export const calls = new Entity(
  {
    model: {
      entity: "call",
      version: "1",
      service: "calls",
    },
    attributes: {
      callId: { type: "string", required: true },
      businessId: { type: "string", required: true },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
        readOnly: true,
      },
      updatedAt: {
        type: "string",
        watch: "*",
        set: () => new Date().toISOString(),
        readOnly: true,
      },
      name: { type: "string", required: false },
      summary: { type: "string", required: false },
      transcript: { type: "string", required: false },
      participants: {
        type: "list",
        items: { type: "string" },
        required: false,
      },
      date: { type: "string", required: false },
      duration: { type: "number", required: false },
    },
    indexes: {
      primary: {
        pk: { field: "callId", composite: ["callId"] },
      },
      byBusiness: {
        index: "BusinessIndex",
        pk: { field: "businessId", composite: ["businessId"] },
        projection: "all",
      },
    },
  },
  { table: callTable, client },
);

export const fileEntities = new Entity(
  {
    model: {
      entity: "fileEntity",
      version: "1",
      service: "fileEntities",
    },
    attributes: {
      fileId: { type: "string", required: true },
      createdAt: {
        type: "string",
        default: () => new Date().toISOString(),
        readOnly: true,
      },
      updatedAt: {
        type: "string",
        watch: "*",
        set: () => new Date().toISOString(),
        readOnly: true,
      },
      businessId: { type: "string", required: true },
      jobId: { type: "string", required: true },
      workspaceId: { type: "string", required: true },
      fileSignature: { type: "string", required: true },
      companyId: { type: "string", required: false },
      status: { type: "string", required: true },
      name: { type: "string", required: false },
      type: { type: "string", required: false },
      size: { type: "number", required: false },
      url: { type: "string", required: false },
      uploaderUserId: { type: "string", required: false },
    },
    indexes: {
      primary: {
        pk: { field: "fileId", composite: ["fileId"] },
      },
      byJob: {
        index: "JobIndex",
        pk: { field: "jobId", composite: ["jobId"] },
      },
      byWorkspace: {
        index: "WorkspaceIndex",
        pk: { field: "workspaceId", composite: ["workspaceId"] },
      },
      byCompany: {
        index: "CompanyIndex",
        pk: { field: "companyId", composite: ["companyId"] },
      },
      byFileSignature: {
        index: "FileSignatureIndex",
        pk: { field: "fileSignature", composite: ["fileSignature"] },
      },
      byStatus: {
        index: "StatusIndex",
        pk: { field: "status", composite: ["status"] },
      },
      byBusiness: {
        index: "BusinessIndex",
        pk: { field: "businessId", composite: ["businessId"] },
      },
    },
  },
  { table: fileEntitiesTable, client },
);

export const crustdata = new Entity(
  {
    model: {
      entity: "crustdata",
      version: "1",
      service: "crustdata",
    },
    attributes: {
      domain: { type: "string", required: true },
      createdAt: { type: "string", required: true },
      data: { type: "map", required: false, properties: {} },
    },
    indexes: {
      primary: {
        pk: { field: "domain", composite: ["domain"] },
        sk: { field: "createdAt", composite: ["createdAt"] },
      },
      byDomain: {
        index: "domainIndex",
        pk: { field: "domain", composite: ["domain"] },
      },
    },
  },
  { table: crustdataTable, client },
);

export const crustdataFounders = new Entity(
  {
    model: {
      entity: "crustdataFounders",
      version: "1",
      service: "crustdataFounders",
    },
    attributes: {
      domain: { type: "string", required: true },
      createdAt: { type: "string", required: true },
      updatedAt: {
        type: "string",
        watch: "*",
        set: () => new Date().toISOString(),
        readOnly: true,
      },
      company_id: { type: "number", required: false },
      founders: { type: "any", required: false },
    },
    indexes: {
      primary: {
        pk: { field: "domain", composite: ["domain"] },
        sk: { field: "createdAt", composite: ["createdAt"] },
      },
      byDomain: {
        index: "domainIndex",
        pk: { field: "domain", composite: ["domain"] },
      },
    },
  },
  { table: crustdataFoundersTable, client },
);
const db = {
  users,
  workspaces,
  emails,
  jobs,
  businesses,
  calls,
  fileEntities,
  crustdata,
  crustdataFounders,
  templates,
  profiles,
};

export default db;
