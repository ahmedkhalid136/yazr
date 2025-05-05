import db from "@/.server/electroDb.server";
import { CreateEntityItem } from "electrodb";

type CreateBusinessPayload = CreateEntityItem<typeof db.businesses>;
type CreateUserPayload = CreateEntityItem<typeof db.users>;
type CreateWorkspacePayload = CreateEntityItem<typeof db.workspaces>;
type CreateJobPayload = CreateEntityItem<typeof db.jobs>;
type CreateCallPayload = CreateEntityItem<typeof db.calls>;
type CreateFileEntityPayload = CreateEntityItem<typeof db.fileEntities>;
type TemplatePayload = CreateEntityItem<typeof db.templates>;
type CreateProfilePayload = CreateEntityItem<typeof db.profiles>;
type Field = {
  id: number;
  value: string;
  prompt: string;
  proposeChange: string;
  editedAt: string;
  source: string;
  approvedBy: string;
  title: string;
  category:
    | "product"
    | "financial"
    | "overview"
    | "team"
    | "market"
    | "investment"
    | "other";
};

export type {
  CreateBusinessPayload,
  CreateUserPayload,
  CreateWorkspacePayload,
  CreateJobPayload,
  CreateCallPayload,
  CreateFileEntityPayload,
  CreateProfilePayload,
  Field,
};
