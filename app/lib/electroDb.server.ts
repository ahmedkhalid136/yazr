import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { Entity } from "electrodb";
import { Resource } from "sst";

const client = new DynamoDBClient({});

const usersTable = Resource.UserDb.name;

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
