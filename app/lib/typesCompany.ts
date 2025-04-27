import { DatabaseIcon } from "lucide-react";
import { z } from "zod";

// Basic Utility Schemas
const URLSchema = z.string();
const YearSchema = z.number().int();
const PercentageSchema = z.number();
const CurrencySchema = z.number();

const SourceSchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  details: z.string().optional(),
});
// Team Member Schema
const TeamMemberSchema = z.object({
  name: z.string(),
  title: z.string(),
  background: z.string(),
  linkedin: z.string().optional(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

// Funding Round Schema
const FundingRoundSchema = z.object({
  source: SourceSchema,
  round: z.union([
    z.enum([
      "Unspecified",
      "Pre-seed",
      "Bridge",
      "Seed",
      "Series A",
      "Series B",
      "Series C",
      "Series D",
      "Series E",
      "Series F",
      "Series G",
      "Series H",
    ]),
    z.string(),
  ]),
  date: z.string(),
  amount: CurrencySchema,
  valuation: CurrencySchema,
  leadInvestor: z.string().optional(),
  multiple: z.number().optional(),
});
export type FundingRound = z.infer<typeof FundingRoundSchema>;
// Ownership Information Schema
const OwnershipInfoSchema = z.object({
  capTable: z
    .array(
      z.object({
        stakeholder: z.string(),
        ownership: PercentageSchema,
        source: SourceSchema,
      }),
    )
    .optional(),
  fundingHistory: z
    .object({
      source: SourceSchema,
      rounds: z.array(FundingRoundSchema),
    })
    .optional(),
  legalEntityStructure: z
    .object({
      subsidiaries: z.array(z.string()).optional(),
      parentCompany: z.string().optional(),
      partnerships: z.array(z.string()).optional(),
      source: SourceSchema,
    })
    .optional(),
});

// Company Basic Information Schema
const CompanyBasicInfoSchema = z.object({
  companyName: z.string(),
  urls: z.object({
    website: z.string().optional(),
    linkedin: z.string().optional(),
    companiesHouse: z.string().optional(),
  }),
  headquarters: z
    .object({
      city: z.string(),
      country: z.string(),
      regionalFocus: z.string().optional(),
      source: SourceSchema,
    })
    .optional(),
  founded: YearSchema.optional(),
  industry: z.object({
    primarySector: z.string().optional(),
    subSector: z.string().optional(),
    source: SourceSchema,
  }),
  businessModel: z.string().optional(),
  stage: z.string().optional(),
  overview: z.string().optional(),
  clientList: z.array(z.string()).optional(),
  competitiveAdvantage: z.string().optional(),
});

// Product Information Schema
const ProductInfoSchema = z.object({
  descriptionAndVision: z.string(),
  mainFeatures: z.object({
    features: z.array(z.string()),
    source: SourceSchema,
  }),
  targetCustomers: z.array(z.string()),
  businessModel: z.object({
    description: z.string(),
    pricing: z.string(),
    feeStructure: z.string(),
    source: SourceSchema,
  }),
  gtmStrategy: z.object({
    source: SourceSchema,
    strategy: z.string(),
  }),
  productServiceOffering: z.string(),
  targetMarket: z.object({
    source: SourceSchema,
    market: z.string(),
  }),
  addressableMarket: z
    .object({
      tam: CurrencySchema.optional(),
      sam: CurrencySchema.optional(),
      som: CurrencySchema.optional(),
    })
    .optional(),
  marketShare: z
    .object({
      source: SourceSchema,
      share: PercentageSchema,
    })
    .optional(),
  competitiveAdvantage: z
    .object({
      source: SourceSchema,
      advantage: z.string(),
    })
    .optional(),
  pricingModel: z
    .object({
      source: SourceSchema,
      model: z.string(),
    })
    .optional(),
  productRoadmap: z
    .object({
      source: SourceSchema,
      roadmap: z.string(),
    })
    .optional(),
  competition: z
    .object({
      source: SourceSchema,
      competitors: z.array(z.string()),
    })
    .optional(),
});

// Team Information Schema
const TeamInfoSchema = z.object({
  leadership: z.array(TeamMemberSchema).optional(),
  teamSize: z.number().int().optional(),
  keyRoles: z.array(TeamMemberSchema).optional(),
  governance: z.object({
    boardMembers: z.array(TeamMemberSchema).optional(),
    advisoryBoard: z.array(TeamMemberSchema).optional(),
  }),
  cultureValues: z.string().optional(),
  source: SourceSchema,
});

// Financial Metrics Schema
const FinancialMetricsSchema = z.object({
  latest: z.lazy(() => PeriodFinancialsSchema),
  historical: z.array(z.lazy(() => PeriodFinancialsSchema)).optional(),
  projected: z.array(z.lazy(() => PeriodFinancialsSchema)).optional(),
  source: SourceSchema,
});

// Period Financials Schema
const PeriodFinancialsSchema = z.object({
  source: SourceSchema,
  period: z
    .object({
      year: z.number().int(),
      quarter: z.number().int().optional(),
      month: z.number().int().optional(),
    })
    .optional(),
  revenueMetrics: z
    .object({
      revenue: CurrencySchema.optional(),
      mrr: CurrencySchema.optional(),
      arr: CurrencySchema.optional(),
      carr: CurrencySchema.optional(),
      yoyArrGrowth: PercentageSchema.optional(),
      yoyCarrGrowth: PercentageSchema.optional(),
      yearOfReference: z.number().optional(),
    })
    .optional(),
  profitabilityMetrics: z
    .object({
      cogs: CurrencySchema.optional(),
      grossProfit: CurrencySchema.optional(),
      grossProfitMargin: PercentageSchema.optional(),
      personnelCosts: CurrencySchema.optional(),
      salesAndMarketing: CurrencySchema.optional(),
      rAndD: CurrencySchema.optional(),
      otherOperatingCosts: CurrencySchema.optional(),
      ebitda: CurrencySchema.optional(),
      ebitdaMargin: PercentageSchema.optional(),
      deprecationAndAmortization: CurrencySchema.optional(),
      ebit: CurrencySchema.optional(),
      interestExpense: CurrencySchema.optional(),
      incomeTax: CurrencySchema.optional(),
      netIncome: CurrencySchema.optional(),
      breakEvenPoint: CurrencySchema.optional(),
      yearOfReference: z.number().optional(),
    })
    .optional(),
  cashMetrics: z
    .object({
      startingCashBalance: CurrencySchema.optional(),
      operationalCashFlow: CurrencySchema.optional(),
      investingCashFlow: CurrencySchema.optional(),
      financingCashFlow: CurrencySchema.optional(),
      freeCashFlows: CurrencySchema.optional(),
      endingCashBalance: CurrencySchema.optional(),
      cashBreakEvenPoint: CurrencySchema.optional(),
      monthlyBurnRate: CurrencySchema.optional(),
      runway: z.number().int().optional(), // months
      outstandingDebt: CurrencySchema.optional(),
      yearOfReference: z.number().optional(),
    })
    .optional(),
  unitEconomics: z
    .object({
      contractCount: z.number().int().optional(),
      averageContractValue: CurrencySchema.optional(),
      customerCount: z.number().int().optional(),
      activeCustomerCount: z.number().int().optional(),
      cac: CurrencySchema.optional(),
      ltv: CurrencySchema.optional(),
      cacLtvRatio: z.number().optional(),
      paybackPeriod: z.number().int().optional(), // months
      churnRate: PercentageSchema.optional(),
      averageContractLength: z.number().int().optional(), // months
    })
    .optional(),
  valuation: z.object({
    currentValuation: CurrencySchema.optional(),
    impliedMultiples: z
      .object({
        revenueMultiple: z.number().optional(),
        ebitdaMultiple: z.number().optional(),
      })
      .optional(),
    transactionComps: z
      .array(
        z.object({
          companyName: z.string().optional(),
          date: z.date().optional(),
          multiple: z.number().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
  }),
});
export type PeriodFinancialsSchemaType = z.infer<typeof PeriodFinancialsSchema>;

// Benchmarking Metrics Schema
const BenchmarkingMetricsSchema = z.object({
  peers: z.array(
    z.object({
      companyName: z.string(),
      metrics: z.object({
        clientMetrics: z.object({
          totalClients: z.string(),
          payingClients: z.string(),
          source: SourceSchema,
        }),
        revenueMetrics: z.object({
          arr: z.string(),
          carr: z.string(),
          arrGrowth: z.string(),
          carrGrowth: z.string(),
          source: SourceSchema,
        }),
        contractMetrics: z.object({
          acv: z.string(),
          averageContractLength: z.string(),
          source: SourceSchema,
        }),
        financialMetrics: z.object({
          grossMargin: z.string(),
          ebitdaMargin: z.string(),
          nrr: z.string(),
          churn: z.string(),
          cashBurn: z.string(),
          burnMultiple: z.string(),
          ruleOf40: z.string(),
          source: SourceSchema,
        }),
        salesMetrics: z.object({
          cac: z.string(),
          salesCycle: z.string(),
          ltvCac: z.string(),
          cacPayback: z.string(),
          source: SourceSchema,
        }),
        fteCount: z.object({
          source: SourceSchema,
          count: z.string(),
        }),
      }),
    }),
  ),
});

export const BulletSchema = z.array(z.string());
export const CallSchema = z.object({
  callId: z.string(),
  businessId: z.string(),
  date: z.string(),
  companyParticipants: z.array(z.string()), // Participants from company using platform, array of user IDs
  externalParticipant: z.string(),
  externalParticipantCompany: z.string().optional(),
  externalParticipantPosition: z.string().optional(), // TODO depends how many external participants we have
  externalParticipantRelationship: z.array(z.string()), // Relationship to company being analysed
  transcript: z.string(),
  // AI-generated
  summary: BulletSchema.optional(),
  highlights: BulletSchema.optional(),
  challenges: BulletSchema.optional(),
});
export type CallType = z.infer<typeof CallSchema>;

// Calls schema
const CallsSummarySchema = z.object({
  overallSummary: BulletSchema,
  overallHighlights: BulletSchema,
  overallChallenges: BulletSchema,
});

const KpisSchema = z.object({
  clients: z.number().int().optional(),
  fteCount: z.number().int().optional(),
  arr: z.number().optional(),
  carr: z.number().optional(),
  acv: z.number().optional(),
  ltv: z.number().optional(),
  cac: z.number().optional(),

  marginGrossProfit: z.number().optional(),
  marginEbitda: z.number().optional(),
  marginNetIncome: z.number().optional(),
  burnRate: z.number().optional(),
  runway: z.number().optional(),
  cashBreakEvenPoint: z.number().optional(),
});

// Company Profile Schema
export const BusinessDataSchema = z.object({
  basicInfo: CompanyBasicInfoSchema,
  productInfo: ProductInfoSchema.optional(),
  teamInfo: TeamInfoSchema.optional(),
  ownershipInfo: OwnershipInfoSchema.optional(),
  financials: FinancialMetricsSchema.optional(),
  benchmarking: BenchmarkingMetricsSchema.optional(),
  kpis: KpisSchema.optional(),
  updatedAt: z.string(),
  highlights: z
    .object({
      segment: z.string(),
      fteCount: z.string(),
      arr: z.string(),
      growth: z.string(),
      country: z.string(),
      foundingYear: z.string(),
    })
    .optional(),
  currentDeal: z
    .object({
      raiseAmount: z.number(),
      instrumentType: z.string(),
      valuation: z.number(),
      useOfFunds: z.string(),
      source: SourceSchema,
    })
    .optional(),
});
export const BusinessProfileSchema = z.object({
  status: z.string().optional(),
  domain: z.string(),
  onePagerUrl: z.string().optional(),
  calls: CallsSummarySchema.optional(),
  hasPrivateProfile: z.boolean(),
  hasWebProfile: z.boolean(),
  webProfile: BusinessDataSchema.optional(),
  privateProfile: BusinessDataSchema.optional(),
  companyProfile: BusinessDataSchema.optional(),
  profileId: z.string(),
  businessUrlSlug: z.string(),
  workspaceId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: z.object({
    email: z.string(),
    userId: z.string(),
  }),
});

// Company Raw Data Schema
export const CompanyRawDataSchema = z.object({
  company: z.string(),
  problem: z.string(),
  solution: z.string(),
  product: z.string(),
  market: z.string(),
  businessModel: z.string(),
  team: z.string(),
  raising: z.string(),
  financials: z.string(),
  milestones: z.string(),
  competitors: z.string(),
  clients: z.string(),
  other: z.string(),
});

// Main Company Profile Type
export type BusinessData = z.infer<typeof BusinessDataSchema>;

export type CompanyRawData = z.infer<typeof CompanyRawDataSchema>;

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;
// data we retrieve from the decks.`
export const CompanyInputSchema = z.object({
  // First Page Highlights
  highlights: z.object({
    segment: z.string(),
    fteCount: z.string(),
    arr: z.string(),
    growth: z.string(),
    country: z.string(),
    foundingYear: z.string(),
  }),
  industry: z.string(),
  name: z.string(),
  // Overview Section
  overview: z.string(),

  // Product Section
  product: z.object({
    descriptionAndVision: z.string(),
    mainFeatures: z.array(z.string()),
    targetCustomers: z.array(z.string()),
    competitiveAdvantage: z.string(),
    businessModel: z.object({
      description: z.string(),
      pricing: z.string(),
      feeStructure: z.string(),
    }),
    gtmStrategy: z.string(),
    competitors: z.array(z.string()),
  }),

  // Team Section
  team: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      background: z.string(),
    }),
  ),

  // KPIs Section
  kpis: z.object({
    clientMetrics: z.object({
      totalClients: z.number(),
      payingClients: z.number(),
    }),
    revenueMetrics: z.object({
      arr: z.number(),
      carr: z.number(),
      arrGrowth: z.number(),
      carrGrowth: z.number(),
      yearOfReference: z.number(),
    }),
    contractMetrics: z.object({
      acv: z.number(),
      averageContractLength: z.number(),
      yearOfReference: z.number(),
    }),
    financialMetrics: z.object({
      grossMargin: z.number(),
      ebitdaMargin: z.number(),
      nrr: z.number(),
      churn: z.number(),
      cashBurn: z.number(),
      burnMultiple: z.number(),
      ruleOf40: z.number(),
      yearOfReference: z.number(),
    }),
    salesMetrics: z.object({
      cac: z.number(),
      salesCycle: z.number(),
      ltvCac: z.number(),
      cacPayback: z.number(),
      yearOfReference: z.number(),
    }),
    fteCount: z.number(),
    generalComments: z.string(),
  }),

  // Current Clients
  clients: z.array(z.string()),

  // Equity Story
  equityStory: z.object({
    fundingHistory: z.array(
      z.object({
        round: z.string().optional(),
        date: z.string(),
        amount: z.string(),
        lead: z.string().optional(),
        otherInvestors: z.array(z.string()).optional(),
      }),
    ),
    currentShareholders: z.array(
      z.object({
        name: z.string(),
        ownership: z.string(),
      }),
    ),
    currentDeal: z.object({
      raiseAmount: z.string(),
      instrumentType: z.string(),
      valuation: z.string().optional(),
      useOfFunds: z.array(z.string()),
    }),
  }),
});
export type CompanyInput = z.infer<typeof CompanyInputSchema>;

// Company Data
// ================================
// Weekly Crustdata profile
// Documenta based company information
// Calls
// Web info from Gemini/Perplexity etc...
// ================================
// Summary company profile
//  // Files
//  // Calls
//  // Company Profile
// Changes in company profile

// Flow
// - Add a new company
// - Start the search for on the Web and on Crustdata
// - Save data in Crustdata DB
// - Creation of the profile from all the gathered information
// - Upload documents
