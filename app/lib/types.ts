import { founderProfileSchema } from "./typesCrust";
import { CompanyRawData } from "./typesCompany";
import { z } from "zod";
import { businesses, users, workspaces } from "./electroDb.server";
import { EntityItem } from "electrodb";

export type OpenAiFileSettings = {
  threadId: string;
  assistantId: string;
  fileIds: string[];
};

export const MiniUserSchema = z.object({
  PK: z.string(),
  name: z.string(),
  profileImageUrl: z.string().optional(),
  surname: z.string(),
  workspaceId: z.string(),
});

export type User = EntityItem<typeof users>;
export type Workspace = EntityItem<typeof workspaces>;
export type Business = EntityItem<typeof businesses>;
export type MiniUser = z.infer<typeof MiniUserSchema>; // For searching users by other users in same workspace, hides fields such as email and password hash

export const SignupFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  companyName: z.string(),
  name: z.string().optional(),
  surname: z.string().optional(),
});
export type SignupForm = z.infer<typeof SignupFormSchema>;

export const LoginFormSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export type LoginForm = z.infer<typeof LoginFormSchema>;

export enum JobStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  PROCESSING = "processing",
}

export enum FileStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum ProcessingStatus {
  FILE_UPLOAD_START = "file_upload_start",
  FILE_CONVERSION_START = "file_conversion_start",
  PAGE_SEQUENCER = "page_sequencer",
  PAGE_AI_EXTRACTION_START = "page_ai_extraction_start",
  PAGE_DATA_IMPROVEMENT_START = "data_improvement_start",
  FILE_AI_ANALYSIS_START = "file_ai_analysis_start",
  FILE_COMPLETED = "file_completed",
  JOB_START = "job_start",
  JOB_FILE_SEQUENCER = "job_file_sequencer",
  JOB_AI_ANALYSIS = "ai_analysis",
  JOB_PROFILE_CREATION = "job_profile_creation",
  JOB_RAG_PREPARATION = "job_rag_preparation",
  JOB_ONE_PAGER_CREATION = "job_one_pager_creation",
  JOB_ONE_MINUTE_PODCAST_CREATION = "job_one_minute_podcast_creation",
  JOB_NOTIFICATION_SEND = "job_notification_send",
  JOB_COMPLETED = "job_completed",
  JOB_FAILED = "job_failed",
  JOB_WEB_ENHANCEMENT = "job_web_enhancement",
  FILE_FAILED = "file_failed",
}

export type UploadFormData = {
  email: string;
  subject: string;
  body: string;
  attachments: string[];
  id: string;
};

export type PitchEmailFormData = {
  email: string;
  subject: string;
  body: string;
  attachments: string[];
  id: string;
  constIndex: "constIndex";
  openAiSettings?: {
    threadId: string;
    assistantId: string;
    fileId: string;
  };
};

export enum JobFileType {
  EMAIL = "email",
  UPLOAD = "upload",
  SHARED_POINT = "shared_point",
}

export type JobType = {
  onePagerUrl?: string;
  jobId: string;
  type: JobFileType;
  status: JobStatus;
  constIndex: "constIndex";
  rawData?: CompanyRawData;
  fileUrls?: string[];
  imageUrls?: string[];
  workspaceId: string;
  createdAt: string;
  creator: {
    email: string;
    name: string;
    surname: string;
  };
  userId: string;
  updatedAt?: string;
  companyDetails?: {
    companyName: string;
    companyId: string;
  };
  processPhase?: ProcessingStatus;
  ai?: { openAiSettings: OpenAiFileSettings };
  fileStatus: {
    fileId: string;
    fileUrl: string;
    status: FileStatus;
  }[];
  retryCount?: number;
  businessProfileId: string;
};

export enum QueueJobType {
  FILE = "file",
  PAGE = "page",
  JOB = "job",
}

export type MessageProcessing = {
  type: QueueJobType;
  id: string;
  nextStep: ProcessingStatus;
  other?: string;
};

export interface ResponseType {
  isSuccess: boolean;
  msg: string;
}

export const FileSchema = z.object({
  fileId: z.string(),
  businessId: z.string(),
  workspaceId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  jobId: z.string(),
  userId: z.string(),
  fileSignature: z.string(),
  fileUrl: z.string(),
  uploadDate: z.string(),
  status: z.nativeEnum(FileStatus),
  retryCount: z.number(),
  retryDate: z.string().optional(),
  fileFormat: z.string(),
  fileName: z.string(),
  from: z.string(),
  category: z.string(),
  title: z.string().optional(),
  companyName: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateOfReference: z.string().optional(),
  description: z.string().optional(),
  processPhase: z.nativeEnum(ProcessingStatus),
  imageUrls: z.array(z.string()).optional(),
  imageMdUrls: z.array(z.string()).optional(),
  filePages: z.number().optional(),
  filePagesCompleted: z.number().optional(),
  pagesStatus: z
    .array(
      z.object({
        pageUrl: z.string(),
        status: z.nativeEnum(FileStatus),
        createdAt: z.string(),
        updatedAt: z.string(),
        retryCount: z.number(),
      }),
    )
    .optional(),
});

export type FileType = z.infer<typeof FileSchema>;

const HeadcountTimeseriesSchema = z.object({
  date: z.string(),
  employee_count: z.number(),
});

const TrafficSourceTimeseriesSchema = z.object({
  date: z.string(),
  traffic_source_social_pct: z.number().optional(),
  traffic_source_search_pct: z.number().optional(),
  traffic_source_direct_pct: z.number().optional(),
  traffic_source_paid_referral_pct: z.number().optional(),
  traffic_source_referral_pct: z.number().optional(),
});

const GrowthPercentSchema = z.object({
  mom: z.number().nullable(),
  qoq: z.number().nullable(),
  yoy: z.number().nullable(),
  six_months: z.number().nullable(),
  two_years: z.number().nullable(),
});

const GrowthAbsoluteSchema = z.object({
  mom: z.number().nullable(),
  qoq: z.number().nullable(),
  yoy: z.number().nullable(),
  six_months: z.number().nullable(),
  two_years: z.number().nullable(),
});

const HeadcountByRoleSchema = z.record(z.number());
const HeadcountByRegionSchema = z.record(z.number());
const HeadcountBySkillSchema = z.record(z.number());
const RoleMetricsSchema = z.object({
  all_roles: z.string().nullable(),
  "0_to_10_percent": z.string().nullable(),
  "11_to_30_percent": z.string().nullable(),
  "31_to_50_percent": z.string().nullable(),
  "51_to_70_percent": z.string().nullable(),
  "71_to_100_percent": z.string().nullable(),
});

const RegionMetricsSchema = z.object({
  all_regions: z.string().nullable(),
  "0_to_10_percent": z.string().nullable(),
  "11_to_30_percent": z.string().nullable(),
  "31_to_50_percent": z.string().nullable(),
  "51_to_70_percent": z.string().nullable(),
  "71_to_100_percent": z.string().nullable(),
});

const SkillMetricsSchema = z.object({
  all_skills: z.string().nullable(),
  "0_to_10_percent": z.string().nullable(),
  "11_to_30_percent": z.string().nullable(),
  "31_to_50_percent": z.string().nullable(),
  "51_to_70_percent": z.string().nullable(),
  "71_to_100_percent": z.string().nullable(),
});

const HeadcountSchema = z.object({
  linkedin_headcount: z.number(),
  linkedin_headcount_total_growth_percent: GrowthPercentSchema,
  linkedin_headcount_total_growth_absolute: GrowthAbsoluteSchema,
  linkedin_headcount_by_role_absolute: HeadcountByRoleSchema,
  linkedin_headcount_by_role_percent: HeadcountByRoleSchema,
  linkedin_role_metrics: RoleMetricsSchema,
  linkedin_headcount_by_role_six_months_growth_percent: z.record(
    z.number().nullable(),
  ),
  linkedin_headcount_by_role_yoy_growth_percent: z.record(
    z.number().nullable(),
  ),
  linkedin_headcount_by_region_absolute: HeadcountByRegionSchema,
  linkedin_headcount_by_region_percent: HeadcountByRegionSchema,
  linkedin_region_metrics: RegionMetricsSchema,
  linkedin_headcount_by_skill_absolute: HeadcountBySkillSchema,
  linkedin_headcount_by_skill_percent: HeadcountBySkillSchema,
  linkedin_skill_metrics: SkillMetricsSchema,
  linkedin_headcount_timeseries: z.array(HeadcountTimeseriesSchema),
  linkedin_headcount_by_function_timeseries: z
    .object({
      CURRENT_FUNCTION: z.record(z.array(HeadcountTimeseriesSchema)),
      GEO_REGION: z.record(z.array(HeadcountTimeseriesSchema)),
    })
    .optional(),
});

const MonthlyVisitorsTimeseriesSchema = z.object({
  date: z.string(),
  monthly_visitors: z.number(),
});

const WebsiteTrafficSchema = z.object({
  website_monthly_visits_timeseries: z.array(MonthlyVisitorsTimeseriesSchema),
  traffic_source_social_pct_timeseries: z.array(TrafficSourceTimeseriesSchema),
  traffic_source_search_pct_timeseries: z.array(TrafficSourceTimeseriesSchema),
  traffic_source_direct_pct_timeseries: z.array(TrafficSourceTimeseriesSchema),
  traffic_source_paid_referral_pct_timeseries: z.array(
    TrafficSourceTimeseriesSchema,
  ),
  traffic_source_referral_pct_timeseries: z.array(
    TrafficSourceTimeseriesSchema,
  ),
});

const GlassdoorSchema = z.object({
  glassdoor_overall_rating: z.number().nullable(),
  glassdoor_ceo_approval_pct: z.number().nullable(),
  glassdoor_business_outlook_pct: z.number().nullable(),
  glassdoor_review_count: z.number().nullable(),
  glassdoor_senior_management_rating: z.number().nullable(),
  glassdoor_compensation_rating: z.number().nullable(),
  glassdoor_career_opportunities_rating: z.number().nullable(),
  glassdoor_culture_rating: z.number().nullable(),
  glassdoor_diversity_rating: z.number().nullable(),
  glassdoor_work_life_balance_rating: z.number().nullable(),
  glassdoor_recommend_to_friend_pct: z.number().nullable(),
  glassdoor_ceo_approval_growth_percent: GrowthPercentSchema.nullable(),
  glassdoor_review_count_growth_percent: GrowthPercentSchema.nullable(),
});

const G2Schema = z.object({
  g2_review_count: z.number().nullable(),
  g2_average_rating: z.number().nullable(),
  g2_review_count_mom_pct: z.number().nullable(),
  g2_review_count_qoq_pct: z.number().nullable(),
  g2_review_count_yoy_pct: z.number().nullable(),
});

const LinkedinFollowersSchema = z.object({
  linkedin_followers: z.number(),
  linkedin_follower_count_timeseries: z.array(
    z.object({
      date: z.string(),
      follower_count: z.number(),
    }),
  ),
  linkedin_followers_mom_percent: z.number().nullable(),
  linkedin_followers_qoq_percent: z.number().nullable(),
  linkedin_followers_six_months_growth_percent: z.number().nullable(),
  linkedin_followers_yoy_percent: z.number().nullable(),
});

const FundingMilestoneSchema = z.object({
  funding_milestone_amount_usd: z.number(),
  funding_round: z.string(),
  funding_milestone_investors: z.string(),
  date: z.string(),
});

const FundingAndInvestmentSchema = z.object({
  crunchbase_total_investment_usd: z.number(),
  days_since_last_fundraise: z.number(),
  last_funding_round_type: z.string(),
  crunchbase_investors_info_list: z.array(
    z.object({
      name: z.string(),
      uuid: z.string(),
      type: z.string(),
    }),
  ),
  crunchbase_investors: z.array(z.string()),
  last_funding_round_investment_usd: z.number(),
  funding_milestones_timeseries: z.array(FundingMilestoneSchema),
});

const JobOpeningsSchema = z.object({
  recent_job_openings_title: z.string().nullable(),
  job_openings_count: z.number().nullable(),
  job_openings_count_growth_percent: GrowthPercentSchema.nullable(),
  job_openings_by_function_qoq_pct: z.record(z.number().nullable()),
  job_openings_by_function_six_months_growth_pct: z.record(
    z.number().nullable(),
  ),
  open_jobs_timeseries: z.array(
    z.object({
      date: z.string(),
      open_jobs: z.number(),
    }),
  ),
  recent_job_openings: z.array(z.unknown()), // Assuming this can be any array
});

const SEOSchema = z.object({
  average_seo_organic_rank: z.number(),
  monthly_paid_clicks: z.number(),
  monthly_organic_clicks: z.number(),
  average_ad_rank: z.number(),
  total_organic_results: z.number(),
  monthly_google_ads_budget: z.number(),
  monthly_organic_value: z.number(),
  total_ads_purchased: z.number(),
  lost_ranked_seo_keywords: z.number(),
  gained_ranked_seo_keywords: z.number(),
  newly_ranked_seo_keywords: z.number(),
});

const FoundersSchema = z.object({
  founders_locations: z.array(z.string()),
  founders_education_institute: z.string(),
  founders_degree_name: z.string(),
  founders_previous_companies: z.array(z.string()),
  founders_previous_titles: z.array(z.string()),
});

const NewsArticleSchema = z.object({
  article_url: z.string(),
  article_publisher_name: z.string(),
  article_title: z.string(),
  article_publish_date: z.string(),
  company_id: z.number(),
});

export type CrustDataItem = z.infer<typeof CrustDataItemSchema>;

const CrustDataItemSchema = z.object({
  company_id: z.number(),
  company_name: z.string(),
  linkedin_profile_url: z.string(),
  crunchbase_profile_url: z.string(),
  linkedin_id: z.string(),
  linkedin_logo_url: z.string(),
  company_twitter_url: z.string(),
  company_website_domain: z.string(),
  hq_country: z.string(),
  headquarters: z.string(),
  largest_headcount_country: z.string(),
  hq_street_address: z.string(),
  company_website: z.string(),
  year_founded: z.string(),
  fiscal_year_end: z.null(),
  estimated_revenue_lower_bound_usd: z.number(),
  estimated_revenue_higher_bound_usd: z.number(),
  employee_count_range: z.string(),
  company_type: z.string(),
  linkedin_company_description: z.string(),
  acquisition_status: z.null(),
  markets: z.array(z.string()),
  stock_symbols: z.null(),
  ceo_location: z.string(),
  all_office_addresses: z.null(),
  taxonomy: z.object({
    linkedin_specialities: z.null(),
    linkedin_industries: z.array(z.string()),
    crunchbase_categories: z.array(z.string()),
  }),
  competitors: z.object({
    competitor_website_domains: z.array(z.string()),
    paid_seo_competitors_website_domains: z.string(),
    organic_seo_competitors_website_domains: z.array(z.string()),
  }),
  headcount: HeadcountSchema,
  website_traffic: WebsiteTrafficSchema,
  glassdoor: GlassdoorSchema,
  g2: G2Schema,
  linkedin_followers: LinkedinFollowersSchema,
  funding_and_investment: FundingAndInvestmentSchema,
  job_openings: JobOpeningsSchema,
  seo: SEOSchema,
  founders: FoundersSchema,
  news_articles: z.array(NewsArticleSchema),
  producthunt: z.array(z.unknown()),
  is_full_domain_match: z.boolean(),
});

const WebEnhancementSchema = z.object({
  companyName: z.string(),
  domainName: z.string(),
  crustData: CrustDataItemSchema,
  productInfo: z.string(),
  crustProfiles: z.object({
    founders: z.array(founderProfileSchema),
    company_id: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
});

export type WebEnhancementType = z.infer<typeof WebEnhancementSchema>;
