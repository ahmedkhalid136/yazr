import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  FileStatus,
  ProcessingStatus,
  FileType,
  JobStatus,
  JobType,
  PitchEmailFormData,
  UploadFormData,
  User,
  Workspace,
} from "@/lib/types";
import { Resource } from "sst";
import { BusinessProfile, CallType } from "./typesCompany";
import {
  CrustCompanyFounders,
  CrustCompanyType,
  CrustFounderProfile,
} from "./crustdata.server";

const fakeCalls = [
  {
    businessId: "biz_tech_123",
    callId: "call_a",
    date: "2024-02-01",
    companyParticipants: ["Alice Johnson", "Bob Smith"],
    externalParticipant: "John Doe",
    externalParticipantCompany: "StartupX",
    externalParticipantPosition: "VP of Sales",
    externalParticipantRelationship: ["Potential Partner"],
    transcript: "Discussion on potential partnership opportunities...",
    summary: [
      "Explored collaboration opportunities in the European market.",
      "Discussed potential pricing models and revenue sharing.",
    ],
    highlights: [
      "John Doe expressed strong interest in partnership.",
      "Company’s technology was well received.",
    ],
    challenges: [
      "Uncertainty about long-term revenue potential.",
      "Concerns about market saturation.",
    ],
  },
  {
    businessId: "biz_tech_123",
    callId: "call_b",
    date: "2024-02-05",
    companyParticipants: ["Alice Johnson", "Charlie Brown"],
    externalParticipant: "Sarah Lee",
    externalParticipantCompany: "StartupY",
    externalParticipantPosition: "Director of Compliance",
    externalParticipantRelationship: ["Regulatory Advisor"],
    transcript: "Discussion on regulatory challenges in expansion...",
    summary: [
      "Reviewed legal requirements for entering new markets.",
      "Discussed potential hurdles and compliance strategies.",
    ],
    highlights: [
      "Gained insights into key compliance factors.",
      "Identified potential legal partners for further consultation.",
    ],
    challenges: [
      "Regulatory landscape is complex and evolving.",
      "High legal costs for compliance procedures.",
    ],
  },
  {
    businessId: "biz_tech_123",
    callId: "call_c",
    date: "2024-02-10",
    companyParticipants: ["Bob Smith", "Charlie Brown"],
    externalParticipant: "Emily Davis",
    externalParticipantCompany: "StartupZ",
    externalParticipantPosition: "CEO",
    externalParticipantRelationship: ["Potential Investor"],
    transcript: "Discussion on funding opportunities and investment...",
    summary: [
      "Explored funding opportunities and potential investment rounds.",
      "Discussed company valuation and financial projections.",
    ],
    highlights: [
      "Emily Davis showed interest in funding the next round.",
      "Positive outlook on the company’s growth strategy.",
    ],
    challenges: [
      "Concerns about current revenue streams.",
      "Need for stronger market penetration before securing investment.",
    ],
  },
];

const fakeBusinessProfile = {
  onePagerUrl: "https://example.com/onepager",
  basicInfo: {
    companyName: "Tech Innovators Inc.",
    urls: {
      website: "https://techinnovators.com",
      linkedin: "https://linkedin.com/company/techinnovators",
      companiesHouse: "https://www.companieshouse.gov.uk/company/01234567",
    },
    headquarters: {
      city: "San Francisco",
      country: "USA",
      regionalFocus: "North America",
    },
    founded: 2015,
    industry: {
      primarySector: "Technology",
      subSector: "Software",
    },
    businessModel: "B2B SaaS",
    stage: "Growth",
    overview:
      "Tech Innovators Inc. is a leading provider of innovative tech solutions for modern businesses. Tech Innovators provides SaaS products to large businesses and SMBs, focusing on cloud-based collaboration tools and project management solutions.",
  },
  productInfo: {
    productServiceOffering: "Cloud-based collaboration platform",
    targetMarket: "Enterprise-level businesses and SMBs",
    addressableMarket: {
      tam: 1000000000, // Total Addressable Market: $1B
      sam: 500000000, // Serviceable Addressable Market: $500M
      som: 200000000, // Serviceable Obtainable Market: $200M
    },
    marketShare: 15.5, // Percentage market share
    competitiveAdvantage:
      "Seamless integration with existing workflows and superior customer service.",
    pricingModel: "Subscription based",
    useCases: [
      "remote collaboration",
      "project management",
      "document sharing",
      "team communication",
    ],
    productRoadmap: "Expand AI-assisted features in the next release.",
    competition: [
      {
        name: "CollabWorks",
        website: "https://collabworks.com",
      },
      {
        name: "SyncTech",
        website: "https://synctech.com",
      },
    ],
  },
  teamInfo: {
    leadership: [
      {
        name: "Alice Johnson",
        title: "CEO",
        background:
          "20 years in tech leadership with a focus on SaaS products.",
      },
      {
        name: "Bob Smith",
        title: "CTO",
        background: "Expert in cloud technologies and platform scalability.",
      },
    ],
    teamSize: 150,
    keyRoles: [
      {
        name: "Carol Davis",
        title: "CFO",
        background:
          "Extensive background in corporate finance for tech companies.",
      },
      {
        name: "David Lee",
        title: "COO",
        background:
          "Experienced operations strategist in fast-growing startups.",
      },
    ],
    governance: {
      boardMembers: [
        {
          name: "Emma Wilson",
          title: "Board Chair",
          background:
            "Renowned venture capitalist with broad industry insights.",
        },
      ],
      advisoryBoard: [
        {
          name: "Frank Martin",
          title: "Advisor",
          background: "Seasoned entrepreneur with multiple successful exits.",
        },
      ],
    },
    cultureValues: "Innovation, integrity, and inclusiveness.",
  },
  calls: {
    overallSummary: [
      "Company held three calls with key external stakeholders.",
      "Topics included partnership discussions, regulatory concerns, and funding opportunities.",
      "Several challenges were identified, particularly around compliance and market competition.",
    ],
    overallHighlights: [
      "Strong interest in collaboration from external participants.",
      "Potential funding opportunity identified in the final call.",
      "Positive feedback on the company’s market positioning.",
    ],
    overallChallenges: [
      "Regulatory hurdles pose challenges to market expansion.",
      "Pricing concerns were raised during discussions.",
      "Need for clearer value proposition in investment negotiations.",
    ],
    calls: fakeCalls,
  },
  financials: {
    historical: [
      {
        period: {
          year: 2020,
        },
        revenueMetrics: {
          revenue: 10000,
          revenueGrowthRate: 20,
        },
        profitabilityMetrics: {
          cogs: 0,
          grossProfit: 0,
          grossProfitMargin: 0,
          personnelCosts: 0,
          salesAndMarketing: 0,
          rAndD: 0,
          otherOperatingCosts: 0,
          ebitda: 0,
          ebitdaMargin: 0,
          deprecationAndAmortization: 0,
          ebit: 0,
          interestExpense: 0,
          incomeTax: 0,
          netIncome: 0,
          breakEvenPoint: 0,
        },
        cashMetrics: {
          startingCashBalance: 0,
          operationalCashFlow: 0,
          investingCashFlow: 0,
          financingCashFlow: 0,
          freeCashFlows: 0,
          endingCashBalance: 0,
          cashBreakEvenPoint: 0,
          monthlyBurnRate: 0,
          runway: 0, // months
          outstandingDebt: 0,
        },
        unitEconomics: {
          contractCount: 1,
          averageContractValue: 10000,
          customerCount: 1,
          activeCustomerCount: 1,
          cac: 0,
          ltv: 0,
          cacLtvRatio: 1,
          paybackPeriod: 6, // months
          churnRate: 0,
        },
        valuation: {
          currentValuation: 10000,
          impliedMultiples: {
            revenueMultiple: 5,
            ebitdaMultiple: 3,
          },
        },
      },
      {
        period: {
          year: 2021,
        },
        revenueMetrics: {
          revenue: 20000,
          revenueGrowthRate: 100,
        },
        profitabilityMetrics: {
          cogs: 0,
          grossProfit: 10,
          grossProfitMargin: 53,
          personnelCosts: 0,
          salesAndMarketing: 0,
          rAndD: 0,
          otherOperatingCosts: 0,
          ebitda: 0,
          ebitdaMargin: 20,
          deprecationAndAmortization: 0,
          ebit: 0,
          interestExpense: 0,
          incomeTax: 0,
          netIncome: 0,
          breakEvenPoint: 0,
        },
        cashMetrics: {
          startingCashBalance: 0,
          operationalCashFlow: 0,
          investingCashFlow: 0,
          financingCashFlow: 0,
          freeCashFlows: 0,
          endingCashBalance: 0,
          cashBreakEvenPoint: 0,
          monthlyBurnRate: 20000,
          runway: 0, // months
          outstandingDebt: 0,
        },
        unitEconomics: {
          contractCount: 1,
          averageContractValue: 20000,
          customerCount: 1,
          activeCustomerCount: 1,
          cac: 100,
          ltv: 50,
          cacLtvRatio: 1,
          paybackPeriod: 6, // months
          churnRate: 0,
        },
        valuation: {
          currentValuation: 100000,
          impliedMultiples: {
            revenueMultiple: 5,
            ebitdaMultiple: 3,
          },
        },
      },
    ],
    projected: [],
  },
  emailId: "contact@techinnovators.com",
  profileId: "profile_001",
  businessId: "biz_tech_123",
  workspaceId: "workspace_tech_innovators",
  jobId: "job_56789",
  createdAt: "2023-01-01T00:00:00Z",
  updatedAt: "2023-09-30T00:00:00Z",
};

const fakeWorkspace = {
  PK: "a4c2ebe8-3c2c-4c8b-8ba3-271f1e1575a4",
  company: "Blackfin",
  profileImageUrl: "",
  createdAt: "",
  updatedAt: "",
  workspaceId: "a4c2ebe8-3c2c-4c8b-8ba3-271f1e1575a4",
};

const fakeFiles: FileType[] = [
  {
    fileId: "file_001",
    businessId: "biz_tech_123",
    workspaceId: "ws_123",
    createdAt: "2025-02-20T10:00:00Z",
    updatedAt: "2025-02-21T12:00:00Z",
    jobId: "job_456",
    userId: "user_789",
    fileSignature: "abc123signature",
    // fileUrl: "https://example.com/files/file_001.pdf",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
    uploadDate: "2025-02-20",
    status: FileStatus.PROCESSING,
    retryCount: 1,
    fileFormat: "pdf",
    fileName: "Quarterly Report Q1",
    from: "Finance Team",
    category: "Company Presentations",
    title: "Q1 Financial Report",
    companyName: "XYZ Corp",
    tags: ["report", "finance", "quarterly"],
    dateOfReference: "2025-01-31",
    description: "Quarterly financial performance report.",
    processPhase: ProcessingStatus.FILE_COMPLETED,
    imageUrls: ["https://example.com/images/file_001_page1.jpg"],
    imageMdUrls: [],
    filePages: 10,
    filePagesCompleted: 3,
    pagesStatus: [
      {
        pageUrl: "https://example.com/pages/file_001_page1",
        status: FileStatus.COMPLETED,
        createdAt: "2025-02-20T10:10:00Z",
        updatedAt: "2025-02-21T10:20:00Z",
        retryCount: 0,
      },
    ],
  },
  {
    fileId: "file_002",
    businessId: "biz_tech_123",
    workspaceId: "ws_123",
    createdAt: "2025-02-19T08:30:00Z",
    updatedAt: "2025-02-21T09:00:00Z",
    jobId: "job_457",
    userId: "user_790",
    fileSignature: "xyz987signature",
    fileUrl: "https://example.com/files/file_002.docx",
    uploadDate: "2025-02-19",
    status: FileStatus.COMPLETED,
    retryCount: 0,
    fileFormat: "docx",
    fileName: "Annual Budget Plan",
    from: "Finance Team",
    category: "Company Presentations",
    title: "2025 Budget Plan",
    companyName: "XYZ Corp",
    tags: ["budget", "finance", "planning"],
    dateOfReference: "2025-02-01",
    description: "Detailed financial planning for 2025.",
    processPhase: ProcessingStatus.FILE_COMPLETED,
    imageUrls: [],
    imageMdUrls: [],
    filePages: 20,
    filePagesCompleted: 20,
  },
  {
    fileId: "file_003",
    businessId: "biz_tech_123",
    workspaceId: "ws_456",
    createdAt: "2025-02-18T14:15:00Z",
    updatedAt: "2025-02-20T16:00:00Z",
    jobId: "job_458",
    userId: "user_791",
    fileSignature: "lmn456signature",
    fileUrl: "https://example.com/files/file_003.pdf",
    uploadDate: "2025-02-18",
    status: FileStatus.PROCESSING,
    retryCount: 2,
    retryDate: "2025-02-19T15:00:00Z",
    fileFormat: "pdf",
    fileName: "Patient Report 101",
    from: "Healthcare Dept.",
    category: "Financials",
    title: "Medical Case Study",
    companyName: "ABC Health",
    tags: ["healthcare", "medical", "patient"],
    dateOfReference: "2025-01-20",
    description: "A case study on patient treatment.",
    processPhase: ProcessingStatus.FILE_COMPLETED,
    imageUrls: ["https://example.com/images/file_003_page1.jpg"],
    imageMdUrls: [],
    filePages: 15,
    filePagesCompleted: 5,
  },
  {
    fileId: "file_004",
    businessId: "biz_tech_123",
    workspaceId: "ws_789",
    createdAt: "2025-02-22T09:45:00Z",
    updatedAt: "2025-02-22T10:30:00Z",
    jobId: "job_459",
    userId: "user_792",
    fileSignature: "pqr654signature",
    fileUrl: "https://example.com/files/file_004.pptx",
    uploadDate: "2025-02-22",
    status: FileStatus.COMPLETED,
    retryCount: 0,
    fileFormat: "pptx",
    fileName: "Tech Trends 2025",
    from: "Tech Research Team",
    category: "Competitors",
    title: "Future of AI & Machine Learning",
    companyName: "InnovateTech",
    tags: ["technology", "AI", "research"],
    dateOfReference: "2025-02-10",
    description: "A presentation on upcoming AI trends.",
    processPhase: ProcessingStatus.FILE_COMPLETED,
    imageUrls: [],
    imageMdUrls: [],
    filePages: 30,
  },
  {
    fileId: "file_005",
    businessId: "biz_tech_123",
    workspaceId: "ws_789",
    createdAt: "2025-02-17T07:20:00Z",
    updatedAt: "2025-02-18T11:00:00Z",
    jobId: "job_460",
    userId: "user_793",
    fileSignature: "uvw321signature",
    fileUrl: "https://example.com/files/file_005.pdf",
    uploadDate: "2025-02-17",
    status: FileStatus.COMPLETED,
    retryCount: 1,
    retryDate: "2025-02-18T09:00:00Z",
    fileFormat: "pdf",
    fileName: "Cybersecurity Guidelines",
    from: "IT Security Dept.",
    category: "Call Transcripts",
    title: "Best Practices in Cybersecurity",
    companyName: "CyberSafe Inc.",
    tags: ["cybersecurity", "IT", "guidelines"],
    dateOfReference: "2025-02-05",
    description: "A document detailing cybersecurity measures.",
    processPhase: ProcessingStatus.FILE_COMPLETED,
    imageUrls: ["https://example.com/images/file_005_page1.jpg"],
    imageMdUrls: [],
    filePages: 12,
    filePagesCompleted: 12,
  },
];

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const db = {
  workspace: {
    create: async (workspace: Workspace) => {
      const response = await createItem(Resource.WorkspaceDb.name, workspace);
      if (!response.isSuccess) {
        throw new Error(`Error creating user: ${response.msg}`);
      }
      return response;
    },
    get: async (workspaceId: string): Promise<Workspace> => {
      const workspace = (await getItem(Resource.WorkspaceDb.name, {
        PK: workspaceId,
      })) as Workspace;

      // return workspace;
      return fakeWorkspace;
    },
    delete: async (workspaceId: string) => {
      await deleteItem(Resource.WorkspaceDb.name, {
        PK: workspaceId,
      });
    },
  },
  email: {
    get: async (id: string): Promise<PitchEmailFormData> => {
      const email = (await getItem(Resource.EmailTable.name, {
        id,
      })) as PitchEmailFormData;
      return email;
    },
    getByApproved: async (): Promise<PitchEmailFormData[]> => {
      const emails = (await queryItems(
        Resource.EmailTable.name,
        "ApprovedIndex",
        "approved",
        "true",
      )) as { items: PitchEmailFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },
    getNItems: async (n = 50): Promise<PitchEmailFormData[]> => {
      const emails = (await getNItems(
        Resource.EmailTable.name,
        "CreationIndex",
        n,
      )) as { items: PitchEmailFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },
    getAll: async (): Promise<PitchEmailFormData[]> => {
      const emails = (await queryItems(
        Resource.EmailTable.name,
        "ConstIndex",
        "constIndex",
        "constIndex",
      )) as { items: PitchEmailFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },

    getByLatest: async (n = 50): Promise<PitchEmailFormData[]> => {
      const emails = (await getNItems(
        Resource.EmailTable.name,
        "CreationIndex",
        n,
      )) as { items: PitchEmailFormData[] | null; lastEvaluatedKey?: any };
      return emails.items || [];
    },
    create: async (email: PitchEmailFormData) => {
      try {
        const response = await createItem(Resource.EmailTable.name, email);
        if (!response.isSuccess) {
          throw new Error(`Error creating email: ${response.msg}`);
        }
        return response;
      } catch (error) {
        console.log("create email error", error);
        throw new Error(`Error creating email: ${error}`);
      }
    },
    delete: async (emailId: string) => {
      await deleteItem(Resource.EmailTable.name, {
        id: emailId,
      });
    },
  },
  businesses: {
    create: async (profile: BusinessProfile) => {
      console.log("Creating business profile", profile);
      const response = await createItem(Resource.Businesses.name, profile);
      if (!response.isSuccess) {
        throw new Error(`Error creating CompanyProfile: ${response.msg}`);
      }
      return response;
    },
    get: async (profileId: string): Promise<BusinessProfile | null> => {
      const profile = await getItem(Resource.Businesses.name, {
        profileId,
      });
      // return profile as BusinessProfile | null;
      return profile as BusinessProfile | null;
    },
    delete: async (profileId: string) => {
      await deleteItem(Resource.Businesses.name, {
        profileId,
      });
    },
    getAll: async (workspaceId: string): Promise<BusinessProfile[]> => {
      const profiles = await queryItems(
        Resource.Businesses.name,
        "WorkspaceIndex",
        "workspaceId",
        workspaceId,
      );
      return profiles.items || [];
    },
    update: async (profileId: string, profile: BusinessProfile) => {
      const oldProfile = await getItem(Resource.Businesses.name, {
        profileId,
      });
      if (!oldProfile) {
        throw new Error(`Profile not found: ${profileId}`);
      }
      await createItem(Resource.Businesses.name, {
        ...oldProfile,
        ...profile,
        profileId,
      });
    },
  },
  call: {
    create: async (call: CallType) => {
      const response = await createItem(Resource.Call.name, call);
      if (!response.isSuccess) {
        throw new Error(`Error creating CompanyProfile: ${response.msg}`);
      }
      return response;
    },
    get: async (callId: string): Promise<CallType | null> => {
      const call = await getItem(Resource.Call.name, {
        callId,
      });
      return call as CallType;
    },
    delete: async (callId: string) => {
      await deleteItem(Resource.Call.name, {
        callId,
      });
    },
    getFromBusinessId: async (businessId: string): Promise<CallType[]> => {
      const calls = await queryItems(
        Resource.Call.name,
        "BusinessIndex",
        "businessId",
        businessId,
      );
      return [...(calls.items || [])];
    },
  },
  job: {
    create: async (job: JobType) => {
      await createItem(Resource.Jobs.name, job);
    },
    update: async (job: JobType) => {
      const oldJob = await getItem(Resource.Jobs.name, {
        workspaceId: job.workspaceId,
        createdAt: job.createdAt,
      });
      await createItem(Resource.Jobs.name, { ...oldJob, ...job });
    },
    get: async (
      workspaceId: string,
      createdAt: string,
    ): Promise<JobType | null> => {
      const job = await getItem(Resource.Jobs.name, {
        workspaceId,
        createdAt,
      });
      console.log("Job from Dynamo?", job);
      return job as JobType | null;
    },
    getLatest: async (workspaceId: string, limit = 50): Promise<JobType[]> => {
      const command = new QueryCommand({
        TableName: Resource.Jobs.name,
        KeyConditionExpression: "workspaceId = :workspaceId",
        ExpressionAttributeValues: {
          ":workspaceId": workspaceId,
        },
        ScanIndexForward: false, // This will return items in descending order (newest first)
        Limit: limit,
      });

      const data = await client.send(command);
      return (data.Items || []) as JobType[];
    },
    queryFromEmailId: async (emailId: string): Promise<JobType[]> => {
      const jobs = await queryItems(
        Resource.Jobs.name,
        "EmailIndex",
        "emailId",
        emailId,
      );
      return jobs.items || [];
    },
    queryFromStatus: async (status: JobStatus): Promise<JobType[]> => {
      const jobs = await queryItems(
        Resource.Jobs.name,
        "statusIndex",
        "status",
        status,
      );
      return jobs.items || [];
    },
    queryFromJobId: async (jobId: string): Promise<JobType[] | null> => {
      const jobs = await queryItems(
        Resource.Jobs.name,
        "jobIdIndex",
        "jobId",
        jobId,
      );
      return jobs.items || [];
    },
    delete: async (workspaceId: string, createdAt: string) => {
      console.log("Deleting job", workspaceId, createdAt);
      const res = await deleteItem(Resource.Jobs.name, {
        workspaceId,
        createdAt,
      });
      console.log("Delete job response", res);
    },
  },
  file: {
    create: async (file: FileType) => {
      await createItem(Resource.FileEntities.name, file);
      return {
        isSuccess: true,
        msg: "File created",
      };
    },
    update: async (file: FileType) => {
      const oldFile = await getItem(Resource.FileEntities.name, {
        fileId: file.fileId,
      });
      await createItem(Resource.FileEntities.name, { ...oldFile, ...file });
    },
    get: async (fileId: string): Promise<FileType | null> => {
      const file = await getItem(Resource.FileEntities.name, {
        fileId,
      });

      return file as FileType | null;
    },
    getLatest: async (workspaceId: string, limit = 50): Promise<FileType[]> => {
      const command = new QueryCommand({
        TableName: Resource.FileEntities.name,
        KeyConditionExpression: "workspaceId = :workspaceId",
        ExpressionAttributeValues: {
          ":workspaceId": workspaceId,
        },
        ScanIndexForward: false, // This will return items in descending order (newest first)
        Limit: limit,
      });

      const data = await client.send(command);
      return (data.Items || []) as FileType[];
    },
    queryFromEmailId: async (emailId: string): Promise<FileType[]> => {
      const files = await queryItems(
        Resource.FileEntities.name,
        "EmailIndex",
        "emailId",
        emailId,
      );
      return files.items || [];
    },
    queryFromJobId: async (jobId: string): Promise<FileType[]> => {
      const files = await queryItems(
        Resource.FileEntities.name,
        "JobIndex",
        "jobId",
        jobId,
      );
      return files.items || [];
    },
    queryFromBusinessId: async (businessId: string): Promise<FileType[]> => {
      const files = await queryItems(
        Resource.FileEntities.name,
        "BusinessIndex",
        "businessId",
        businessId,
      );
      return files.items || [];
    },
    queryFromStatus: async (status: FileStatus): Promise<FileType[]> => {
      const files = await queryItems(
        Resource.FileEntities.name,
        "StatusIndex",
        "status",
        status,
      );
      return files.items || [];
    },
    queryFromSignature: async (fileSignature: string): Promise<FileType[]> => {
      const files = await queryItems(
        Resource.FileEntities.name,
        "FileSignatureIndex",
        "fileSignature",
        fileSignature,
      );
      return files.items || [];
    },
    delete: async (fileId: string) => {
      console.log("Deleting file", fileId);
      const res = await deleteItem(Resource.FileEntities.name, {
        fileId,
      });
      console.log("Delete file response", res);
    },

    atomicIncrementPageCompletion: async (fileId: string, pageUrl: string) => {
      const command = new UpdateCommand({
        TableName: Resource.FileEntities.name,
        Key: { fileId },
        UpdateExpression:
          "SET filePagesCompleted = if_not_exists(filePagesCompleted, :zero) + :inc, " +
          "pagesStatus = list_append(if_not_exists(pagesStatus, :emptyList), :newStatus)",
        ExpressionAttributeValues: {
          ":inc": 1,
          ":zero": 0,
          ":emptyList": [],
          ":newStatus": [
            {
              pageUrl,
              status: FileStatus.COMPLETED,
              updatedAt: new Date().toISOString(),
            },
          ],
        },
        ReturnValues: "ALL_NEW",
      });

      const result = await client.send(command);
      return result.Attributes as FileType;
    },

    atomicCheckCompletion: async (fileId: string) => {
      const command = new UpdateCommand({
        TableName: Resource.FileEntities.name,
        Key: { fileId },
        ConditionExpression: "filePagesCompleted = filePages",
        UpdateExpression: "SET status = :completed",
        ExpressionAttributeValues: {
          ":completed": FileStatus.COMPLETED,
        },
        ReturnValues: "ALL_NEW",
      });

      try {
        const result = await client.send(command);
        return true;
      } catch (error) {
        if (error.name === "ConditionalCheckFailedException") {
          return false;
        }
        throw error;
      }
    },
  },

  crustdata: {
    create: async (crustdata: {
      domain: string;
      // data?: CrustCompanyType;
      dataUrl?: string;
      createdAt: string;
    }): Promise<responseType> => {
      const response = await createItem(Resource.Crustdata.name, crustdata);
      if (!response.isSuccess) {
        throw new Error(`Error creating user: ${response.msg}`);
      }
      return response;
    },
    get: async (
      domain: string,
      createdAt: string,
    ): Promise<CrustCompanyType> => {
      const crustdata = (await getItem(Resource.Crustdata.name, {
        domain,
        createdAt,
      })) as CrustCompanyType;

      return crustdata;
    },
    query: async (
      domain: string,
    ): Promise<
      {
        data?: CrustCompanyType;
        dataUrl?: string;
        daomain: string;
        createdAt: string;
      }[]
    > => {
      const crustdata = await queryItems(
        Resource.Crustdata.name,
        "domainIndex",
        "domain",
        domain,
      );
      return crustdata.items || [];
    },
    delete: async (domain: string, createdAt: string) => {
      await deleteItem(Resource.Crustdata.name, {
        domain,
        createdAt,
      });
    },
  },
  crustdataFounders: {
    create: async (crustdata: CrustCompanyFounders): Promise<responseType> => {
      const response = await createItem(
        Resource.CrustdataFounders.name,
        crustdata,
      );
      if (!response.isSuccess) {
        throw new Error(`Error creating user: ${response.msg}`);
      }
      return response;
    },
    get: async (
      domain: string,
      createdAt: string,
    ): Promise<CrustCompanyFounders> => {
      const crustdata = (await getItem(Resource.CrustdataFounders.name, {
        domain,
        createdAt,
      })) as CrustCompanyFounders;

      return crustdata;
    },
    query: async (
      domain: string,
    ): Promise<
      {
        data?: CrustCompanyFounders;
        dataUrl?: string;
        daomain: string;
        createdAt: string;
      }[]
    > => {
      const crustdata = await queryItems(
        Resource.CrustdataFounders.name,
        "domainIndex",
        "domain",
        domain,
      );
      return crustdata.items || [];
    },
    delete: async (domain: string, createdAt: string) => {
      await deleteItem(Resource.CrustdataFounders.name, {
        domain,
        createdAt,
      });
    },
  },
};

const getItem = async <T extends Record<string, unknown>>(
  tableName: string,
  idObj: T,
) => {
  // console.log("getItem", tableName, idObj);

  const command = new GetCommand({
    TableName: tableName,
    Key: {
      ...idObj,
    },
  });

  // console.log("getItem", command);

  const data = await client.send(command);
  // console.log("getItem data", data);

  if (!data.Item) return null;
  return data.Item;
};

const getNItems = async (
  tableName: string,
  indexName: string,
  limit: number,
  lastEvaluatedKey?: any,
): Promise<{ items: any[] | null; lastEvaluatedKey?: any }> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: "tConst = :tConst",
      ExpressionAttributeValues: {
        ":tConst": "metadata", // Adjust this value as needed
      },
      ScanIndexForward: false, // To get items in descending order
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const data = await client.send(command);

    if (!data.Items) return { items: null };
    return { items: data.Items, lastEvaluatedKey: data.LastEvaluatedKey };
  } catch (error) {
    console.log("getNItems error", error);
    return { items: null };
  }
};

const queryItems = async (
  tableName: string,
  indexName: string,
  valueKey: string,
  value: string | number | boolean,
  limit?: number,
  lastEvaluatedKey?: any,
): Promise<{ items: any[] | null; lastEvaluatedKey?: any }> => {
  try {
    const command = new QueryCommand({
      TableName: tableName,
      IndexName: indexName,
      ExpressionAttributeNames: {
        "#key": valueKey,
      },
      KeyConditionExpression: "#key = :valueKey",
      ExpressionAttributeValues: {
        ":valueKey": value,
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    });

    const data = await client.send(command);

    if (!data.Items) return { items: null };
    return { items: data.Items, lastEvaluatedKey: data.LastEvaluatedKey };
  } catch (error) {
    console.log("getNItems error", error);
    return { items: null };
  }
};

type responseType = {
  isSuccess: boolean;
  msg: string;
};
const createItem = async <T extends Record<string, any>>(
  tableName: string,
  item: T,
): Promise<responseType> => {
  // console.log("createItem...");
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });

  try {
    await client.send(command);
  } catch (error) {
    console.log("createItem error", error);
    return { isSuccess: false, msg: "error" };
  }

  return { isSuccess: true, msg: "ok" };
};

const deleteItem = async (
  tableName: string,
  idObj: any,
): Promise<responseType> => {
  // console.log("deleteItem", tableName, idObj);

  const command = new DeleteCommand({
    TableName: tableName,
    Key: {
      ...idObj,
    },
  });

  // // console.log("deleteItem", command);
  try {
    await client.send(command);
  } catch (error) {
    return { isSuccess: false, msg: "error" };
  }
  // console.log("geleteItem data", data);

  return { isSuccess: true, msg: "deleted" };
};

export default db;
