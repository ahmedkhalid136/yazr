import { v4 as uuidv4 } from "uuid";
import {
  FileStatus,
  JobFileType,
  JobStatus,
  JobType,
  MessageProcessing,
  ProcessingStatus,
  QueueJobType,
} from "./types";
import crypto from "crypto";
import db from "./db.server";
import s3 from "./s3.server";
import { BusinessProfile } from "./typesCompany";
import {
  CrustCompanyFounders,
  CrustCompanyType,
  CrustFounderProfile,
} from "./crustdata.server";
import { Resource } from "sst";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
const sqs = new SQSClient({});

const checkJobIntegrity = async (
  createdAt: string,
  workspaceId: string,
): Promise<{ ok: boolean; jobId: string }> => {
  if (!createdAt || !workspaceId) {
    console.log("No createdAt or workspaceId");
    return { ok: false, jobId: "" };
  }
  const job = await db.job.get(workspaceId, createdAt);
  if (!job) {
    console.log("No job", job);
    return { ok: false, jobId: "" };
  }

  console.log("Job status", job.status);
  if (job.status !== JobStatus.PENDING) {
    console.log("Job not pending");
    return { ok: false, jobId: "" };
  }
  await db.job.update({
    ...job,
    status: JobStatus.PROCESSING,
  });
  return { ok: true, jobId: job.jobId };
};
const yazrServer = {
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
    }): Promise<JobType> => {
      const newJob: JobType = {
        jobId: jobId || uuidv4(),
        fileUrls: fileUrls,
        status: JobStatus.PENDING,
        constIndex: "constIndex",
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
      };

      await db.job.create(newJob);
      return newJob;
    },
    sendToQueue: async (createdAt: string, workspaceId: string) => {
      const job = await db.job.get(workspaceId, createdAt);
      if (!job) {
        throw new Error("Job not found");
      }
      const message: MessageProcessing = {
        type: QueueJobType.JOB,
        id: job.jobId,
        nextStep: ProcessingStatus.JOB_FILE_SEQUENCER,
      };

      console.log("Sending message to processing queue");
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: Resource.DataProcessingQueue.url,
          MessageBody: JSON.stringify(message),
        }),
      );
    },
  },

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
      // Get file contents as ArrayBuffer
      const buffer = await file.arrayBuffer();

      // Use Node's crypto module

      const hash = crypto.createHash("sha256");

      // Update hash with buffer
      hash.update(Buffer.from(buffer));

      // Get hex digest
      const hashHex = hash.digest("hex");
      return hashHex;
    } catch (error) {
      console.error("Error computing file hash:", error);
      throw error;
    }
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
      linkedin: string;
      primarySector?: string;
      subSector?: string;
      city: string;
      country: string;
      crustData?: CrustCompanyType;
      foundersData?: CrustCompanyFounders;
    }) => {
      const profileId = uuidv4();
      const businessUrlSlug = domain.replace(/\./g, "-");

      let business: BusinessProfile;

      if (crustData) {
        business = yazrServer.mapCrustDataToBusinessProfile(
          crustData,
          description,
          { email, userId },
          foundersData,
        );

        business.profileId = profileId;
        business.businessUrlSlug = businessUrlSlug;
        business.domain = domain;
        business.workspaceId = workspaceId;
      } else {
        business = {
          profileId,
          businessUrlSlug,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          domain: domain,
          hasPrivateProfile: false,
          hasWebProfile: true,
          workspaceId: workspaceId,
          creator: {
            email: email,
            userId,
          },
          webProfile: {
            basicInfo: {
              overview: description,
              companyName,
              urls: {
                website: domain,
                linkedin,
              },
              industry: {
                primarySector,
                subSector,
                source: {
                  name: "crust",
                  details: `created via web at ${new Date().toLocaleString()} by ${email}`,
                },
              },
              headquarters: {
                city,
                country,
                source: {
                  name: "crust",
                  details: `created via web at ${new Date().toLocaleString()} by ${email}`,
                },
              },
            },
            updatedAt: new Date().toISOString(),
          },
          companyProfile: {
            basicInfo: {
              overview: description,
              companyName,
              urls: {
                website: domain,
                linkedin,
              },
              industry: {
                primarySector,
                subSector,
                source: {
                  name: "crust",
                  details: `created via web at ${new Date().toLocaleString()} by ${email}`,
                },
              },
              headquarters: {
                city,
                country,
                source: {
                  name: "crust",
                  details: `created via web at ${new Date().toLocaleString()} by ${email}`,
                },
              },
            },
            updatedAt: new Date().toISOString(),
          },
        };
      }

      const createdBusiness = await db.businesses.create(business);
      return profileId;
    },
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

    // Extract founding year from year_founded string (format: YYYY-MM-DD)
    const foundedYear = crustData.year_founded
      ? parseInt(crustData.year_founded.split("-")[0])
      : undefined;

    // Parse revenue range to get approximate values
    const estimatedRevenue = crustData.estimated_revenue_lower_bound_usd
      ? (crustData.estimated_revenue_lower_bound_usd +
          crustData.estimated_revenue_higher_bound_usd) /
        2
      : 0;

    // Extract headquarters location components
    const headquartersComponents =
      crustData.headquarters?.split(",").map((s) => s.trim()) || [];
    const city = headquartersComponents[0] || "";
    const country = crustData.hq_country || "";

    // Map funding rounds if available
    const fundingRounds =
      crustData.funding_and_investment?.funding_milestones_timeseries?.map(
        (round) => ({
          source: {
            name: "crust",
            details: JSON.stringify({
              domain: crustData.domain,
              createdAt: crustData.createdAt,
            }),
          },
          round: round.funding_round as
            | "Unspecified"
            | "Pre-seed"
            | "Bridge"
            | "Seed"
            | "Series A"
            | "Series B"
            | "Series C"
            | "Series D"
            | "Series E"
            | "Series F"
            | "Series G"
            | "Series H",
          date: round.date,
          amount: round.funding_milestone_amount_usd || 0,
          valuation: 0, // Not provided in CrustData
          leadInvestor: round.funding_milestone_investors
            ?.split(",")[0]
            ?.trim(),
        }),
      ) || [];

    // Map team members from founders if available
    const leadershipTeam =
      foundersData?.founders.map((founder: CrustFounderProfile) => ({
        name: founder.name,
        title: founder.title,
        linkedin: founder.linkedin_profile_url,
        background:
          founder.summary ||
          `${founder.headline}. Previously at ${founder.past_employers?.map((e) => e.employer_name).join(", ")}`,
      })) || [];
    const profile = {
      updatedAt: now,
      basicInfo: {
        companyName: crustData.company_name || "",
        urls: {
          website: crustData.company_website || "",
          linkedin: crustData.linkedin_profile_url || "",
          companiesHouse: "", // Not available in CrustData
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
      // Additional metadata
      onePagerUrl: "",
    };
  },
};

export default yazrServer;
