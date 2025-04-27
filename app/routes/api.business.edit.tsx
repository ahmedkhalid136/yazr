import { ActionFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server";
import {
  BusinessDataSchema,
  BusinessProfileSchema,
  PeriodFinancialsSchemaType,
} from "@/lib/typesCompany";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log("data", data);

  if (!data.profileId) {
    return Response.json({
      ok: false,
      message: "Can't find the profileId",
    });
  }

  const businessProfile = await db.businesses.get(data.profileId as string);
  if (!businessProfile || !businessProfile.companyProfile) {
    return Response.json({
      ok: false,
      message: "Business profile not found",
    });
  }

  switch (data.action) {
    case "overview":
      businessProfile.companyProfile.basicInfo = {
        ...businessProfile?.companyProfile?.basicInfo,
        overview:
          (data.overview as string) ||
          businessProfile?.companyProfile?.basicInfo?.overview,
      };
      break;
    case "basicInfo":
      businessProfile.companyProfile.basicInfo = {
        ...businessProfile?.companyProfile?.basicInfo,
        companyName: (data.companyName as string) || "",
        overview: (data.overview as string) || "",
        urls: {
          ...businessProfile?.companyProfile?.basicInfo?.urls,
          website: (data.website as string) || "",
          linkedin: (data.linkedin as string) || "",
          companiesHouse: (data.companiesHouse as string) || "",
        },
        industry: {
          ...businessProfile?.companyProfile?.basicInfo?.industry,
          primarySector: (data.primarySector as string) || "",
          subSector: (data.subSector as string) || "",
          source:
            JSON.parse(data.source as string) ||
            businessProfile?.companyProfile?.basicInfo?.industry.source,
        },
        headquarters: {
          ...businessProfile?.companyProfile?.basicInfo?.headquarters,
          city: (data.city as string) || "",
          country: (data.country as string) || "",
          regionalFocus: (data.regionalFocus as string) || "",
          source:
            JSON.parse(data.source as string) ||
            businessProfile?.companyProfile?.basicInfo?.headquarters?.source,
        },
        founded: data.founded ? parseInt(data.founded as string) : undefined,
        businessModel: (data.businessModel as string) || "",
        stage: (data.stage as string) || "",
      };

      break;

    case "products":
      console.log("products");
      const productInfo = businessProfile.companyProfile?.productInfo;
      businessProfile.companyProfile.productInfo = {
        ...productInfo,
        businessModel: {
          source:
            JSON.parse(data.source as string) ||
            productInfo?.businessModel.source,
          description: productInfo?.businessModel?.description || "",
          pricing:
            (data.pricingModel as string) ||
            productInfo?.businessModel?.pricing ||
            "",
          feeStructure:
            (data.feeStructure as string) ||
            productInfo?.businessModel?.feeStructure ||
            "",
        },
        descriptionAndVision: productInfo?.descriptionAndVision || "",
        mainFeatures: {
          source: JSON.parse(data.source as string) || "",
          features: productInfo?.mainFeatures?.features || [""],
        },
        targetCustomers: productInfo?.targetCustomers || [""],
        gtmStrategy: {
          source: JSON.parse(data.source as string) || "",
          strategy:
            (data.gtm as string) || productInfo?.gtmStrategy?.strategy || "",
        },
        productServiceOffering:
          (data.productServiceOffering as string) ||
          productInfo?.productServiceOffering ||
          "",
        targetMarket: {
          ...productInfo?.targetMarket,
          market:
            (data.targetMarket as string) ||
            productInfo?.targetMarket?.market ||
            "",
          source:
            JSON.parse(data.source as string) ||
            businessProfile.companyProfile.productInfo?.targetMarket?.source,
        },
        pricingModel: {
          ...productInfo?.pricingModel,
          model:
            (data.pricingModel as string) ||
            productInfo?.pricingModel?.model ||
            "",
          source:
            JSON.parse(data.source as string) ||
            productInfo?.pricingModel?.source,
        },
        productRoadmap: {
          ...productInfo?.productRoadmap,
          roadmap: (data.productRoadmap as string) || "",
          source:
            JSON.parse(data.source as string) ||
            businessProfile.companyProfile.productInfo?.productRoadmap?.source,
        },

        competition: {
          ...businessProfile.companyProfile.productInfo?.competition,
          competitors: data.competition
            ? (data.competition as string).split(",").map((item) => item.trim())
            : businessProfile.companyProfile.productInfo?.competition
                ?.competitors || [""],
          source:
            JSON.parse(data.source as string) ||
            businessProfile.companyProfile.productInfo?.competition?.source,
        },
      };
      businessProfile.companyProfile.basicInfo.competitiveAdvantage =
        (data.competitiveAdvantage as string) ||
        businessProfile.companyProfile.basicInfo.competitiveAdvantage;

      break;

    case "team":
      try {
        const teamData = data.teamData
          ? JSON.parse(data.teamData as string)
          : [];
        const teamSize = parseInt(data.teamSize as string) || 0;
        let newLeadership = [];
        for (let i = 0; i < teamSize; i++) {
          newLeadership.push({
            name: data?.[`team[${i}].name`] || "",
            title: data?.[`team[${i}].title`] || "",
            background: data?.[`team[${i}].background`] || "",
            linkedin: data?.[`team[${i}].linkedin`] || "",
          });
        }
        businessProfile.companyProfile.teamInfo = {
          ...businessProfile.companyProfile?.teamInfo,
          source: JSON.parse(data.source as string) || {
            name: businessProfile.companyProfile?.teamInfo?.source?.name || "",
            url: businessProfile.companyProfile?.teamInfo?.source?.url,
            details: businessProfile.companyProfile?.teamInfo?.source?.details,
          },
          leadership: newLeadership,
        };
      } catch (error) {
        console.error("Error parsing team data:", error);
        return Response.json({
          ok: false,
          message: "Invalid team data format",
        });
      }
      break;

    case "kpis":
      const recentFinancials =
        businessProfile.companyProfile?.financials?.historical?.length &&
        businessProfile.companyProfile?.financials?.historical?.length > 0
          ? businessProfile.companyProfile?.financials?.historical?.sort(
              (a: PeriodFinancialsSchemaType, b: PeriodFinancialsSchemaType) =>
                (b.period?.year || 0) - (a.period?.year || 0),
            )[0]
          : null;
      businessProfile.companyProfile.financials = {
        source: JSON.parse(data.source as string) || {
          name: businessProfile.companyProfile?.financials?.source?.name || "",
          url: businessProfile.companyProfile?.financials?.source?.url || "",
          details:
            businessProfile.companyProfile?.financials?.source?.details || "",
        },
        latest: {
          ...recentFinancials,
          source: JSON.parse(data.source as string) || {
            name:
              businessProfile.companyProfile?.financials?.source?.name || "",
            url: businessProfile.companyProfile?.financials?.source?.url || "",
            details:
              businessProfile.companyProfile?.financials?.source?.details || "",
          },
          revenueMetrics: {
            ...recentFinancials?.revenueMetrics,
            arr: isNaN(parseFloat(data.arr as string))
              ? 0
              : parseFloat(data.arr as string) || 0,
            carr: isNaN(parseFloat(data.carr as string))
              ? 0
              : parseFloat(data.carr as string) || 0,
            yoyArrGrowth: isNaN(parseFloat(data.yoyArrGrowth as string))
              ? 0
              : parseFloat(data.yoyArrGrowth as string),
            yoyCarrGrowth: isNaN(parseFloat(data.yoyCarrGrowth as string))
              ? 0
              : parseFloat(data.yoyCarrGrowth as string),
            yearOfReference: Number(data.year) || 0,
          },
          profitabilityMetrics: {
            ...recentFinancials?.profitabilityMetrics,
            grossProfitMargin: isNaN(
              parseFloat(data.grossProfitMargin as string),
            )
              ? 0
              : parseFloat(data.grossProfitMargin as string) || 0,
            ebitdaMargin: isNaN(parseFloat(data.ebitdaMargin as string))
              ? 0
              : parseFloat(data.ebitdaMargin as string),
          },
          cashMetrics: {
            ...recentFinancials?.cashMetrics,
            monthlyBurnRate: isNaN(parseFloat(data.monthlyBurnRate as string))
              ? 0
              : parseFloat(data.monthlyBurnRate as string),
          },
          valuation: {
            currentValuation: 0,
            impliedMultiples: {
              revenueMultiple: 0,
              ebitdaMultiple: 0,
            },
            transactionComps: [],
          },
          unitEconomics: {
            ...recentFinancials?.unitEconomics,
            cac: isNaN(parseFloat(data.cac as string))
              ? 0
              : parseFloat(data.cac as string) || 0,
            ltv: isNaN(parseFloat(data.ltv as string))
              ? 0
              : parseFloat(data.ltv as string) || 0,
            cacLtvRatio: isNaN(parseFloat(data.cacLtvRatio as string))
              ? 0
              : parseFloat(data.cacLtvRatio as string) || 0,
            customerCount: isNaN(parseFloat(data.customerCount as string))
              ? 0
              : parseFloat(data.customerCount as string) || 0,
          },
        },
      };
      businessProfile.companyProfile = {
        ...businessProfile.companyProfile,
        teamInfo: {
          ...businessProfile.companyProfile?.teamInfo,
          teamSize: parseInt(data.teamSize as string) || 0,
          source: JSON.parse(data.source as string),
        },
      };
      break;
    case "funding":
      try {
        const fundingData = data.fundingData
          ? JSON.parse(data.fundingData as string)
          : [];

        console.log("fundingData parsed", fundingData);
        const fundingSize = parseInt(data.fundingSize as string) || 0;
        let newFunding = [];
        for (let i = 0; i < fundingSize; i++) {
          newFunding.push({
            date: data?.[`fundingData[${i}].date`] || "",
            round: data?.[`fundingData[${i}].round`] || "",
            amount: data?.[`fundingData[${i}].amount`] || "",
            leadInvestor: data?.[`fundingData[${i}].leadInvestor`] || "",
            valuation: data?.[`fundingData[${i}].valuation`] || "",
            source: {
              name: "manual",
              details: "edited via one pager at " + new Date().toISOString(),
            },
          });
        }

        businessProfile.companyProfile.ownershipInfo = {
          ...businessProfile.companyProfile?.ownershipInfo,
          fundingHistory: {
            ...businessProfile.companyProfile?.ownershipInfo?.fundingHistory,
            source: JSON.parse(data.source as string),
            rounds: newFunding.map((item: any, index: number) => ({
              date: item.date || "",
              round: item.round || "Unspecified",
              amount: parseFloat(item.amount) || 0,
              valuation: parseFloat(item.valuation) || 0,
              leadInvestor: item.leadInvestor || "",
              source: item.source || {
                name: "manual",
                details: "edited via one pager at " + new Date().toISOString(),
              },
            })),
          },
        };
      } catch (error) {
        console.error("Error parsing funding data:", error);
        return Response.json({
          ok: false,
          message: "Invalid funding data format",
        });
      }
      break;
    case "currentDeal":
      console.log("currentDeal");
      console.log("data", data);
      businessProfile.companyProfile = {
        ...businessProfile.companyProfile,
        currentDeal: {
          ...businessProfile.companyProfile?.currentDeal,
          raiseAmount: parseFloat(data.raiseAmount as string) || 0,
          instrumentType: data.instrumentType as string,
          valuation: parseFloat(data.valuation as string) || 0,
          useOfFunds: data.useOfFunds as string,
          source: JSON.parse(data.source as string),
        },
      };
      break;
    default:
      return Response.json({
        ok: false,
        message: "Invalid action",
      });
  }

  // Save the updated business profile
  businessProfile.updatedAt = new Date().toISOString();

  // console.log("newBusinessProfile", businessProfile);

  // check the Schema
  const validatedBusinessProfile = BusinessProfileSchema.parse(businessProfile);
  await db.businesses.update(
    businessProfile.profileId as string,
    validatedBusinessProfile,
  );

  return Response.json({
    ok: true,
    message: "Success",
  });
}
