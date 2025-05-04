import { v4 as uuidv4 } from "uuid";
import {
  FileStatus,
  Business,
  FileType,
  JobFileType,
  JobStatus,
  JobType,
  MessageProcessing,
  ProcessingStatus,
  QueueJobType,
  User,
  Workspace,
} from "@/lib/types";
import crypto from "crypto";
import s3 from "../.server/s3.server";
import { BusinessProfile, CallType } from "@/lib/typesCompany";
import {
  CrustCompanyFounders,
  CrustCompanyType,
  CrustFounderProfile,
} from "@/lib/typesCrust";
import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import db, {
  users,
  workspaces,
  businesses,
  jobs,
  calls,
  fileEntities,
  emails,
  templates,
} from "../.server/electroDb.server";
import { CreateEntityItem } from "electrodb";
const sqs = new SQSClient({});

const checkJobIntegrity = async (
  createdAt: string,
  workspaceId: string,
): Promise<{ ok: boolean; jobId: string }> => {
  if (!createdAt || !workspaceId) {
    console.log("No createdAt or workspaceId");
    return { ok: false, jobId: "" };
  }
  const job = await jobs.get({ workspaceId, createdAt }).go();
  if (!job.data) {
    console.log("No job found for:", { workspaceId, createdAt });
    return { ok: false, jobId: "" };
  }

  console.log("Job status", job.data.status);
  if (job.data.status !== JobStatus.PENDING) {
    console.log("Job not pending");
    return { ok: false, jobId: job.data.jobId };
  }
  await jobs
    .update({ workspaceId, createdAt })
    .set({ status: JobStatus.PROCESSING })
    .go();
  return { ok: true, jobId: job.data.jobId };
};

const yazrServerBase = {
  uploadFileToS3: async (file: File, folderId: string): Promise<string> => {
    try {
      const fileUrl =
        folderId + file.name.replace(/\s+/g, "-").replace(/[^\w.-]/g, "");
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);
      const asyncIterable = (async function* () {
        yield uint8Array;
      })();
      await s3.docStoring.upload(asyncIterable, fileUrl, file.type);

      return fileUrl;
    } catch (error) {
      console.error("error in uploadFileToS3", error);
      throw error;
    }
  },
  computeFileHash: async (file: {
    arrayBuffer: () => Promise<ArrayBuffer>;
  }): Promise<string> => {
    try {
      const buffer = await file.arrayBuffer();
      const hash = crypto.createHash("sha256");
      hash.update(Buffer.from(buffer));
      const hashHex = hash.digest("hex");
      return hashHex;
    } catch (error) {
      console.error("Error computing file hash:", error);
      throw error;
    }
  },
  mapCrustDataToBusinessProfile: (
    crustData: CrustCompanyType,
    description?: string,
    creator?: { email: string; userId: string },
    foundersData?: CrustCompanyFounders,
  ): BusinessProfile => {
    const now = new Date().toISOString();
    const profileId = uuidv4();
    const businessUrlSlug = crustData.company_website_domain.replace(
      /\./g,
      "-",
    );
    const foundedYear = crustData.year_founded
      ? parseInt(crustData.year_founded.split("-")[0])
      : undefined;
    const estimatedRevenue = crustData.estimated_revenue_lower_bound_usd
      ? (crustData.estimated_revenue_lower_bound_usd +
          crustData.estimated_revenue_higher_bound_usd) /
        2
      : 0;
    const headquartersComponents =
      crustData.headquarters?.split(",").map((s: string) => s.trim()) || [];
    const city = headquartersComponents[0] || "";
    const country = crustData.hq_country || "";
    const fundingRounds =
      crustData.funding_and_investment?.funding_milestones_timeseries?.map(
        (round: any) => ({
          source: {
            name: "crust",
            details: JSON.stringify({
              domain: crustData.domain,
              createdAt: crustData.createdAt,
            }),
          },
          round: round.funding_round as any,
          date: round.date,
          amount: round.funding_milestone_amount_usd || 0,
          valuation: 0,
          leadInvestor: round.funding_milestone_investors
            ?.split(",")[0]
            ?.trim(),
        }),
      ) || [];
    const leadershipTeam =
      foundersData?.founders.map((founder: CrustFounderProfile) => ({
        name: founder.name,
        title: founder.title,
        linkedin: founder.linkedin_profile_url,
        background:
          founder.summary ||
          `${founder.headline}. Previously at ${founder.past_employers?.map((e: { employer_name: string }) => e.employer_name).join(", ")}`,
      })) || [];
    const profile = {
      updatedAt: now,
      basicInfo: {
        companyName: crustData.company_name || "",
        urls: {
          website: crustData.company_website || "",
          linkedin: crustData.linkedin_profile_url || "",
          companiesHouse: "",
        },
        headquarters: {
          city,
          country,
          regionalFocus: crustData.largest_headcount_country || "",
          source: {
            name: "crust",
            details: JSON.stringify({
              domain: crustData.domain,
              createdAt: crustData.createdAt,
            }),
          },
        },
        founded: foundedYear,
        industry: {
          primarySector:
            crustData.taxonomy.linkedin_industries.join(", ") || "",
          subSector: crustData.taxonomy.crunchbase_categories.join(", ") || "",
          source: {
            name: "crust",
            details: JSON.stringify({
              domain: crustData.domain,
              createdAt: crustData.createdAt,
            }),
          },
        },
        businessModel: crustData.company_type || "",
        stage: crustData.acquisition_status || "",
        overview: description || crustData.linkedin_company_description || "",
      },
      teamInfo: {
        leadership: leadershipTeam,
        teamSize: crustData.headcount?.linkedin_headcount || 0,
        keyRoles: leadershipTeam,
        governance: {
          boardMembers: [],
          advisoryBoard: [],
        },
        cultureValues: "",
        source: {
          name: "crust",
          details: JSON.stringify({
            domain: crustData.domain,
            createdAt: crustData.createdAt,
          }),
        },
      },
      ownershipInfo: {
        capTable: [],
        fundingHistory: {
          source: {
            name: "crust",
            details: JSON.stringify({
              domain: crustData.domain,
              createdAt: crustData.createdAt,
            }),
          },
          rounds: fundingRounds,
        },
      },
    };
    return {
      domain: crustData.domain,
      profileId,
      businessUrlSlug,
      workspaceId: creator?.userId || "",
      createdAt: now,
      updatedAt: now,
      creator: creator || { email: "", userId: "" },
      webProfile: profile,
      companyProfile: profile,
      hasPrivateProfile: false,
      hasWebProfile: true,
      onePagerUrl: "",
    } as BusinessProfile;
  },
};

type CreateBusinessPayload = CreateEntityItem<typeof businesses>;
type CreateUserPayload = CreateEntityItem<typeof users>;
type CreateWorkspacePayload = CreateEntityItem<typeof workspaces>;
type CreateJobPayload = CreateEntityItem<typeof jobs>;
type CreateCallPayload = CreateEntityItem<typeof calls>;
type CreateFileEntityPayload = CreateEntityItem<typeof fileEntities>;
type TemplatePayload = CreateEntityItem<typeof templates>;
const yazrServer = {
  ...yazrServerBase,
  job: {
    createFromUpload: async ({
      email,
      workspaceId,
      userId,
      name,
      fileUrls,
      businessProfileId,
      surname,
      fileStatus,
      jobId,
      emailId,
    }: {
      email: string;
      fileUrls: string[];
      workspaceId: string;
      userId: string;
      name: string;
      surname: string;
      businessProfileId: string;
      fileStatus: {
        fileId: string;
        fileUrl: string;
        status: FileStatus;
      }[];
      jobId?: string;
      emailId: string;
    }) => {
      const newJob = {
        jobId: jobId || uuidv4(),
        fileUrls: fileUrls,
        status: JobStatus.PENDING,
        type: JobFileType.UPLOAD,
        businessProfileId: businessProfileId,
        fileStatus: fileStatus.map((file) => ({
          fileId: file.fileId,
          fileUrl: file.fileUrl,
          status: FileStatus.PENDING,
        })),
        workspaceId: workspaceId,
        createdAt: new Date().toISOString(),
        userId: userId,
        creator: {
          email: email,
          name: name,
          surname: surname,
        },
        emailId: emailId,
      };

      await jobs.put(newJob).go();
      return newJob;
    },
    get: async (workspaceId: string, createdAt: string) => {
      const result = await jobs.get({ workspaceId, createdAt }).go();
      return result.data;
    },
    update: async (jobData: any) => {
      const { workspaceId, createdAt, ...updateData } = jobData;
      const result = await jobs
        .update({ workspaceId, createdAt })
        .set(updateData)
        .go();
      return result.data;
    },
    sendToQueue: async (createdAt: string, workspaceId: string) => {
      const jobResult = await jobs.get({ workspaceId, createdAt }).go();
      if (!jobResult.data) {
        throw new Error("Job not found");
      }
      const message: MessageProcessing = {
        type: QueueJobType.JOB,
        id: jobResult.data.jobId,
        nextStep: ProcessingStatus.JOB_FILE_SEQUENCER,
      };

      console.log("Sending message to processing queue");
    },
  },
  business: {
    createDraft: async ({
      domain,
      description,
      workspaceId,
      userId,
      email,
      companyName,
      linkedin,
      primarySector,
      subSector,
      city,
      country,
      crustData,
      foundersData,
    }: {
      domain: string;
      description: string;
      workspaceId: string;
      userId: string;
      email: string;
      companyName: string;
      linkedin?: string;
      primarySector?: string;
      subSector?: string;
      city?: string;
      country?: string;
      crustData?: CrustCompanyType;
      foundersData?: CrustCompanyFounders;
    }) => {
      const profileId = uuidv4();
      const businessUrlSlug = domain.replace(/\./g, "-");

      let businessData: Business;

      if (crustData) {
        const mappedProfile = yazrServerBase.mapCrustDataToBusinessProfile(
          crustData,
          description,
          { email, userId },
          foundersData,
        );
        businessData = {
          ...mappedProfile,
          constIndex: "constIndex",
        };
      } else {
        businessData = {
          constIndex: "constIndex",
          profileId,
          businessUrlSlug,
          domain: domain,
          hasPrivateProfile: false,
          hasWebProfile: true,
          workspaceId: workspaceId,
          creator: {
            email: email,
            userId,
          },
          companyProfile: {
            basicInfo: {
              overview: description,
              companyName,
              urls: {
                website: domain,
                linkedin: linkedin || "",
              },
              industry: {
                primarySector: primarySector || "",
                subSector: subSector || "",
                source: {
                  name: "manual",
                  details: `created via web at ${new Date().toLocaleString()} by ${email}`,
                },
              },
              headquarters: {
                city: city || "",
                country: country || "",
                source: {
                  name: "manual",
                  details: `created via web at ${new Date().toLocaleString()} by ${email}`,
                },
              },
            },
            updatedAt: new Date().toISOString(),
          },
        };
      }

      await businesses.put(businessData).go();
      return profileId;
    },
    create: async ({
      name,
      domain,
      description,
      workspaceId,
      userId,
      email,
    }: {
      name: string;
      domain: string;
      description: string;
      workspaceId: string;
      userId: string;
      email: string;
    }) => {
      const businessId = uuidv4();
      const businessUrlSlug = domain.replace(/\./g, "-");
      const businessData: Business = {
        businessId,
        businessUrlSlug,
        domain,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workspaceId,
        name,
        hasPrivateProfile: false,
        hasWebProfile: true,
        constIndex: "constIndex",
        creator: {
          email: email,
          userId,
        },
      };
      await db.businesses.put(businessData).go();

      const template = await yazrServer.template.get({ workspaceId });
      if (!template) {
        throw new Error("Template not found");
      }
      const fields = template.fields.map((field) => {
        if (field.category === "Product" && field.title === "description") {
          field.value = description;
          return field;
        }
        return field;
      });
      const profileId = uuidv4();
      const newProfile: BusinessProfile = {
        fields,
        profileId,
        businessUrlSlug,
        domain,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        hasPrivateProfile: false,
        hasWebProfile: false,
        creator: {
          email: email,
          userId,
        },
      };
      await db.profiles.put(newProfile).go();
      return profileId;
    },
    get: async (profileId: string): Promise<BusinessProfile | null> => {
      const result = await businesses.get({ profileId }).go();
      return result.data as BusinessProfile | null;
    },
    getAll: async (workspaceId: string): Promise<BusinessProfile[]> => {
      if (!workspaceId) {
        console.warn("getAllBusinesses called with empty workspaceId");
        return [];
      }
      const result = await businesses.query.byWorkspace({ workspaceId }).go();
      return result.data as BusinessProfile[];
    },
  },
  user: {
    create: async ({
      email,
      name,
      surname,
      companyName,
      workspaceId,
    }: {
      email: string;
      name: string;
      surname: string;
      companyName: string;
      workspaceId: string;
    }): Promise<User> => {
      const userPayload = {
        email,
        name,
        surname,
        companyName,
        workspaceId,
        PK: `USER#${email}`,
        constIndex: "constIndex",
      };
      await users.put(userPayload).go();
      const createdUser = await users.get({ PK: userPayload.PK }).go();
      return createdUser.data as User;
    },
    getByEmail: async ({ email }: { email: string }): Promise<User | null> => {
      const result = await users.query.byEmail({ email }).go();
      return result.data[0] as User | null;
    },
    getAll: async (workspaceId: string): Promise<User[]> => {
      const result = await users.query.byWorkspace({ workspaceId }).go();
      return result.data as User[];
    },
  },
  workspace: {
    create: async (
      workspaceData: Omit<
        Workspace,
        "PK" | "createdAt" | "updatedAt" | "constIndex"
      >,
    ): Promise<Workspace> => {
      const PK = `WS#${uuidv4()}`;
      const now = Date.now();
      const workspacePayload = {
        ...workspaceData,
        PK,
        createdAt: now,
        updatedAt: now,
        constIndex: "constIndex",
      };
      await workspaces.put(workspacePayload).go();
      const createdWs = await workspaces.get({ PK }).go();
      return createdWs.data as Workspace;
    },
    get: async (PK: string): Promise<Workspace | null> => {
      const result = await workspaces.get({ PK }).go();
      return result.data as Workspace | null;
    },
  },
  call: {
    create: async (
      callData: Omit<CallType, "callId" | "createdAt" | "updatedAt">,
    ): Promise<CallType> => {
      const callId = uuidv4();
      const payload: any = {
        ...callData,
        callId,
        summary: Array.isArray(callData.summary)
          ? callData.summary.join("\n")
          : callData.summary,
        highlights: Array.isArray(callData.highlights)
          ? callData.highlights.join("\n")
          : callData.highlights,
        challenges: Array.isArray(callData.challenges)
          ? callData.challenges.join("\n")
          : callData.challenges,
      };

      await calls.put(payload).go();
      const createdCallResult = await calls.get({ callId }).go();
      const createdCallData = createdCallResult.data;
      if (createdCallData) {
        return createdCallData as CallType;
      }
      throw new Error("Failed to create or retrieve call");
    },
    get: async (callId: string): Promise<CallType | null> => {
      const result = await calls.get({ callId }).go();
      return result.data as CallType | null;
    },
    getFromBusinessId: async (businessId: string): Promise<CallType[]> => {
      const result = await calls.query.byBusiness({ businessId }).go();
      return result.data as CallType[];
    },
  },
  file: {
    create: async (
      fileData: Omit<FileType, "fileId" | "createdAt" | "updatedAt">,
    ): Promise<FileType> => {
      const fileId = uuidv4();
      const payload = {
        ...fileData,
        fileId,
      };
      if (
        !payload.businessId ||
        !payload.jobId ||
        !payload.workspaceId ||
        !payload.fileSignature ||
        !payload.status
      ) {
        throw new Error("Missing required fields for file entity creation");
      }
      await fileEntities.put(payload).go();
      const createdFile = await fileEntities.get({ fileId }).go();
      return createdFile.data as FileType;
    },
    get: async (fileId: string): Promise<FileType | null> => {
      const result = await fileEntities.get({ fileId }).go();
      return result.data as FileType | null;
    },
    queryFromBusinessId: async (businessId: string): Promise<FileType[]> => {
      const result = await fileEntities.query.byBusiness({ businessId }).go();
      return result.data as FileType[];
    },
  },
  template: {
    defaultFields: [
      {
        type: "text",
        required: true,
        category: "product",
        value: "",
        prompt: "Please provide a description of the product",
        proposeChange: "",
        editedAt: new Date().toISOString(),
        source: "template",
        approvedBy: "admin",
        title: "Description",
      },
      {
        type: "text",
        required: true,
        category: "product",
        value: "",
        prompt:
          "Please provide a description of the competitive advantage of the product",
        proposeChange: "",
        editedAt: new Date().toISOString(),
        source: "template",
        approvedBy: "admin",
        title: "Competitive Advantage",
      },
      {
        type: "text",
        required: true,
        category: "product",
        value: "",
        prompt:
          "Please provide a description of the target market for the product",
        proposeChange: "",
        editedAt: new Date().toISOString(),
        source: "template",
        approvedBy: "admin",
        title: "Target Market",
      },
      {
        type: "text",
        required: true,
        category: "product",
        value: "",
        prompt:
          "Please provide a description of the target market for the product",
        proposeChange: "",
        editedAt: new Date().toISOString(),
        source: "template",
        approvedBy: "admin",
        title: "Pricing Model",
      },
    ],
    get: async ({
      workspaceId,
    }: {
      workspaceId: string;
    }): Promise<TemplatePayload> => {
      const templates = (await db.templates.query.primary({ workspaceId }).go())
        .data[0];
      if (!templates) {
        const newTemplate: TemplatePayload = {
          templateId: uuidv4(),
          workspaceId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          industry: "new",
          fields: yazrServer.template.defaultFields,
          title: "New Template",
        };
        await db.templates.put(newTemplate).go();
        return newTemplate;
      }
      return templates;
    },
  },
  profile: {
    create: async (
      profileData: Omit<
        BusinessProfile,
        "profileId" | "createdAt" | "updatedAt"
      >,
    ): Promise<BusinessProfile> => {
      const profileId = uuidv4();
      const payload = { ...profileData, profileId };
      await db.profiles.put(payload).go();
      return payload;
    },
  },
};

export default yazrServer;
