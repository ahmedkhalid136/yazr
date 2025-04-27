import PptxGenJS from "pptxgenjs";
import { ShapeType } from "@/lib/pptxgenjs";
import { BusinessProfile, CompanyInput } from "@/lib/typesCompany";

export async function onePagerPPT(
  companyProfile: BusinessProfile,
): Promise<Uint8Array> {
  try {
    const dealTeam = [companyProfile.creator.email];

    const status = companyProfile.status || "ACTIVE";

    const parsedCompanyData: CompanyInput = {
      highlights: {
        segment: companyProfile.companyProfile?.highlights?.segment || "",
        fteCount:
          String(companyProfile.companyProfile?.teamInfo?.teamSize) || "",
        arr:
          String(
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.arr,
          ) || "",
        growth:
          String(
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.yoyArrGrowth,
          ) || "",
        country:
          companyProfile.companyProfile?.basicInfo.headquarters?.country || "",
        foundingYear:
          String(companyProfile.companyProfile?.basicInfo.founded) || "",
      },
      industry:
        companyProfile.companyProfile?.basicInfo.industry.primarySector || "",
      name: companyProfile.companyProfile?.basicInfo.companyName || "",
      overview: companyProfile.companyProfile?.basicInfo.overview || "",

      product: {
        descriptionAndVision:
          companyProfile.companyProfile?.productInfo?.descriptionAndVision ||
          "",
        mainFeatures:
          companyProfile.companyProfile?.productInfo?.mainFeatures?.features ||
          [],
        targetCustomers:
          companyProfile.companyProfile?.productInfo?.targetCustomers || [],
        competitiveAdvantage:
          companyProfile.companyProfile?.productInfo?.competitiveAdvantage
            ?.advantage || "",
        businessModel: {
          description:
            companyProfile.companyProfile?.productInfo?.businessModel
              ?.description || "",
          pricing:
            companyProfile.companyProfile?.productInfo?.businessModel
              ?.pricing || "",
          feeStructure:
            companyProfile.companyProfile?.productInfo?.businessModel
              ?.feeStructure || "",
        },
        gtmStrategy:
          companyProfile.companyProfile?.productInfo?.gtmStrategy?.strategy ||
          "",
        competitors:
          companyProfile.companyProfile?.productInfo?.competition
            ?.competitors || [],
      },

      team: (companyProfile.companyProfile?.teamInfo?.leadership || []).map(
        (member) => ({
          name: member.name,
          role: member.title,
          background: member.background,
        }),
      ),

      kpis: {
        clientMetrics: {
          totalClients: companyProfile.companyProfile?.kpis?.clients || 0,
          payingClients: companyProfile.companyProfile?.kpis?.clients || 0, // Assuming same if not available
        },
        revenueMetrics: {
          arr:
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.arr || 0,
          carr:
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.carr || 0,
          arrGrowth:
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.yoyArrGrowth || 0,
          carrGrowth:
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.yoyCarrGrowth || 0,
          yearOfReference: new Date().getFullYear(),
        },
        contractMetrics: {
          acv:
            companyProfile.companyProfile?.financials?.latest?.unitEconomics
              ?.averageContractValue || 0,
          averageContractLength: 12, // Default to 12 months if not available
          yearOfReference:
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.yearOfReference || 0,
        },
        financialMetrics: {
          grossMargin:
            companyProfile.companyProfile?.financials?.latest
              ?.profitabilityMetrics?.grossProfitMargin || 0,
          ebitdaMargin:
            companyProfile.companyProfile?.financials?.latest
              ?.profitabilityMetrics?.ebitdaMargin || 0,
          nrr: 100, // Default values
          churn: 0,
          cashBurn: companyProfile.companyProfile?.kpis?.burnRate || 0,
          burnMultiple: 0,
          ruleOf40: 0,
          yearOfReference: new Date().getFullYear(),
        },
        salesMetrics: {
          cac:
            companyProfile.companyProfile?.financials?.latest?.unitEconomics
              ?.cac || 0,
          salesCycle: 0 || 0,
          ltvCac:
            companyProfile.companyProfile?.financials?.latest?.unitEconomics
              ?.cacLtvRatio || 0,
          cacPayback:
            companyProfile.companyProfile?.financials?.latest?.unitEconomics
              ?.paybackPeriod || 0,
          yearOfReference:
            companyProfile.companyProfile?.financials?.latest?.revenueMetrics
              ?.yearOfReference || 0,
        },
        fteCount: companyProfile.companyProfile?.teamInfo?.teamSize || 0,
        generalComments: "",
      },

      clients: companyProfile.companyProfile?.basicInfo.clientList || [],

      equityStory: {
        fundingHistory:
          companyProfile.companyProfile?.ownershipInfo?.fundingHistory?.rounds.map(
            (round) => ({
              round: round.round.toString(),
              date: round.date,
              amount: round.amount.toString(),
              lead: round.leadInvestor || "",
              otherInvestors: [],
            }),
          ) || [],

        currentShareholders: (
          companyProfile.companyProfile?.ownershipInfo?.capTable || []
        ).map((shareholder) => ({
          name: shareholder.stakeholder,
          ownership: `${shareholder.ownership}%`,
        })),

        currentDeal: {
          raiseAmount:
            companyProfile.companyProfile?.currentDeal?.raiseAmount?.toString() ||
            "",
          instrumentType:
            companyProfile.companyProfile?.currentDeal?.instrumentType || "",
          valuation:
            companyProfile.companyProfile?.currentDeal?.valuation?.toString() ||
            "",
          useOfFunds: companyProfile.companyProfile?.currentDeal?.useOfFunds
            ? [companyProfile.companyProfile?.currentDeal?.useOfFunds]
            : [],
        },
      },
    };

    console.log("parsedCompanyData", parsedCompanyData, dealTeam, status);
    const pptx = await buildPresentation(parsedCompanyData, dealTeam, status);
    console.log("pptx", pptx);
    return pptx;
  } catch (error) {
    console.error("Error generating one-pager:", error);
    throw error;
  }
}

const buildPresentation = async (
  company: CompanyInput,
  dealTeam: string[],
  status: string,
): Promise<Uint8Array> => {
  // Create a new PowerPoint presentation
  const pres = new PptxGenJS();
  pres.layout = "LAYOUT_4x3";

  const HEADER_COLOUR = "BF9937";
  const SUB_TITLE = "FFF2CC";
  const SECTION_TITLE = "F9DA78";
  // ========================================
  // Slide 1: Company Overview & Header
  // (Replicates the left sidebar with arrow and top header from the HTML)
  // ========================================
  // const slide1 = pres.addSlide();

  // Left Sidebar: draw a white rectangle (with border) and a colored header containing an arrow.
  // slide1.addShape(ShapeType.rect, {
  //   x: 0,
  //   y: 0,
  //   w: 2.7,
  //   h: 7.5,
  //   fill: { color: "FFFFFF" },
  //   line: { color: "000000", width: 1 },
  // });
  // slide1.addShape(ShapeType.rect, {
  //   x: 0,
  //   y: 2.5,
  //   w: 2.7,
  //   h: 1,
  //   fill: { color: "#b8860b" },
  // });
  // slide1.addText("›", {
  //   x: 1.0,
  //   y: 2.65,
  //   w: 0.7,
  //   h: 0.7,
  //   fontSize: 60,
  //   color: "#d3d3d3",
  //   // Using the built-in align property (PptxGenJS V3 supports preset alignments)
  //   align: pres.AlignH.center,
  // });

  // Right Header: add a colored rectangle for the header and overlay text.
  // slide1.addShape(ShapeType.rect, {
  //   x: 2.7,
  //   y: 0,
  //   w: 7.3,
  //   h: 1.5,
  //   fill: { color: "#b8860b" },
  // });
  // slide1.addText(company.name, {
  //   x: 2.8,
  //   y: 0.4,
  //   w: 7.1,
  //   h: 1,
  //   fontSize: 28,
  //   bold: true,
  //   color: "FFFFFF",
  // });
  // slide1.addText("BlackFin Tech", {
  //   x: 8.5,
  //   y: 0.1,
  //   w: 1.5,
  //   h: 0.5,
  //   fontSize: 16,
  //   bold: true,
  //   color: "FFFFFF",
  //   align: pres.AlignH.right,
  // });

  // ========================================
  // Slide 2: Stats, Status, Descriptions, KPIs and Equity Story
  // ========================================
  const slide2 = pres.addSlide();

  // Top Stats Bar (colored background with various metrics)
  slide2.addShape(ShapeType.rect, {
    x: 0,
    y: 0,
    w: 10,
    h: 1.005,
    fill: { color: HEADER_COLOUR },
  });
  slide2.addText(company.industry, {
    x: 0.4,
    y: 0.55,
    w: 2,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: "FFFFFF",
    align: pres.AlignH.center,
    valign: pres.AlignV.top,
    fontFace: "Roboto",
  });
  slide2.addText(`${company.kpis.fteCount} FTEs`, {
    x: 2.25,
    y: 0.55,
    w: 2,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: "FFFFFF",
    align: pres.AlignH.center,
    valign: pres.AlignV.top,
    fontFace: "Roboto",
  });
  slide2.addText(company.name, {
    x: 4,
    y: 0.45,
    w: 2.1,
    h: 0.4,
    fontSize: 20,
    bold: true,
    color: "ffffff",
    align: pres.AlignH.center,
    fontFace: "Roboto",
    valign: pres.AlignV.middle,
  });
  slide2.addText(`${company.kpis.revenueMetrics.arr} ARR`, {
    x: 6.15,
    y: 0.55,
    w: 2,
    h: 0.4,
    fontSize: 12,
    bold: true,
    color: "FFFFFF",
    align: pres.AlignH.center,
    valign: pres.AlignV.top,
    fontFace: "Roboto",
  });
  slide2.addText(
    company.highlights.country + "\n" + company.highlights.foundingYear,
    {
      x: 8,
      y: 0.55,
      w: 2,
      h: 0.4,
      fontSize: 12,
      bold: true,
      fontFace: "Roboto",
      color: "FFFFFF",
      valign: pres.AlignV.top,
      align: pres.AlignH.center,
    },
  );

  // Status Bar: white background with a dashed-style border can be simulated with a text box.
  slide2.addShape(ShapeType.rect, {
    x: 0,
    y: 1.08,
    w: 10,
    h: 0.3,
    fill: { color: SUB_TITLE },
  });
  slide2.addText(`Status: ${status} - Deal Team: ${dealTeam.join(", ")}`, {
    x: 0.2,
    y: 1.08,
    w: 9.6,
    h: 0.3,
    fontSize: 12,
    bold: true,
    fontFace: "Roboto",
    color: "#000000",
  });

  // Left Column: Business Description, Product information and Team.
  slide2.addText("Business Description", {
    x: 0.2,
    y: 1.47,
    w: 4.7,
    h: 0.225,
    fontSize: 12,
    bold: true,
    fill: { color: SECTION_TITLE },
    fontFace: "Roboto",
    align: pres.AlignH.center,
  });
  slide2.addText(company.overview, {
    x: 0.2,
    y: 1.68,
    w: 4.7,
    h: 0.5,
    fontSize: 10,
    color: "#000000",
    valign: pres.AlignV.top,
    fontFace: "Roboto",
  });

  // slide2.addText("Product", {
  //   x: 0.2,
  //   y: 2.33,
  //   w: 4.7,
  //   h: 0.225,
  //   fontSize: 12,
  //   bold: true,
  //   fill: { color: SECTION_TITLE },
  //   fontFace: "Roboto",
  //   align: pres.AlignH.center,
  //   rectRadius: 100,
  // });
  const tableProduct = [
    [
      {
        text: "Vision:",
        options: { fontSize: 10, bold: true },
      },
      {
        text: `${company.product.descriptionAndVision}`,
        options: { fontSize: 9 },
      },
    ],
    [
      {
        text: "Features:",
        options: { fontSize: 10, bold: true },
      },
      {
        text: `${company.product.mainFeatures.join(", ")}`,
        options: { fontSize: 9 },
      },
    ],
    [
      {
        text: "Target Customers:",
        options: { fontSize: 10, bold: true },
      },
      {
        text: `${company.product.targetCustomers.join(", ")}`,
        options: { fontSize: 9 },
      },
    ],
    [
      {
        text: "Business Model:",
        options: { fontSize: 10, bold: true },
      },
      {
        text: `${company.product.businessModel.description}`,
        options: { fontSize: 9 },
      },
    ],
    [
      {
        text: "GTM Strategy:",
        options: { fontSize: 10, bold: true },
      },
      {
        text: `${company.product.gtmStrategy}`,
        options: { fontSize: 9 },
      },
    ],
    [
      {
        text: "Competitors:",
        options: { fontSize: 10, bold: true },
      },
      {
        text: `${company.product.competitors.join(", ")}`,
        options: { fontSize: 9 },
      },
    ],
  ];

  slide2.addTable(tableProduct, {
    x: 0.2,
    y: 2.6,
    w: 4.7,
    colW: [1.1, 3.6],
    border: { pt: 0, color: "d3d3d3" },
    fontFace: "Roboto",
  });

  slide2.addText("Team", {
    x: 0.2,
    y: 5.8,
    w: 4.7,
    h: 0.225,
    fontSize: 12,
    bold: true,
    fill: { color: SECTION_TITLE },
    fontFace: "Roboto",
    align: pres.AlignH.center,
  });

  const teamText = company.team.map((t) => [
    { text: t.name, options: { bold: true } },
    { text: `: ${t.role}, ${t.background}\n` },
  ]);

  slide2.addText(teamText.flat(), {
    x: 0.1,
    y: 6,
    w: 4.7,
    h: 1,
    fontSize: 10,
    color: "#000000",
    valign: pres.AlignV.top,
    fontFace: "Roboto",
  });

  // Right Column: KPIs as a table and Equity Story details.
  const tableRows = [
    [
      {
        text: "Clients:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `Total: ${company.kpis.clientMetrics.totalClients} | Paying: ${company.kpis.clientMetrics.payingClients}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "ARR:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `${company.kpis.revenueMetrics.arr} | Growth: ${company.kpis.revenueMetrics.arrGrowth}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "cARR:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `${company.kpis.revenueMetrics.carr} | Growth: ${company.kpis.revenueMetrics.carrGrowth}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "Contract:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `ACV: ${company.kpis.contractMetrics.acv} | Length: ${company.kpis.contractMetrics.averageContractLength}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "Margins:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `Gross: ${company.kpis.financialMetrics.grossMargin} | EBITDA: ${company.kpis.financialMetrics.ebitdaMargin}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "Retention:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `NRR: ${company.kpis.financialMetrics.nrr} | Churn: ${company.kpis.financialMetrics.churn}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "Burn:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `Monthly: ${company.kpis.financialMetrics.cashBurn} | Multiple: ${company.kpis.financialMetrics.burnMultiple}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "Rule of 40:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `${company.kpis.financialMetrics.ruleOf40}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "Sales Metrics:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `CAC: ${company.kpis.salesMetrics.cac} | Cycle: ${company.kpis.salesMetrics.salesCycle} | LTV/CAC: ${company.kpis.salesMetrics.ltvCac} | Payback: ${company.kpis.salesMetrics.cacPayback}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "FTEs:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
        valign: pres.AlignV.middle,
      },
      {
        text: `${company.kpis.fteCount}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
    [
      {
        text: "Clients:",
        options: { fontSize: 9.5, bold: true, fontFace: "Roboto" },
        w: 1,
      },
      {
        text: `${company.clients.join(", ")}`,
        options: { fontSize: 10, fontFace: "Roboto" },
        w: 3.5,
      },
    ],
  ];
  slide2.addTable(tableRows, {
    x: 5.1,
    y: 1.47,
    w: 4.7,
    colW: [0.9, 3.9],
    border: { pt: 1, color: "ffffff" },
  });
  slide2.addText("Equity Story", {
    x: 5.15,
    y: 5.8,
    w: 4.7,
    h: 0.225,
    fontSize: 12,
    bold: true,
    fill: { color: SECTION_TITLE },
    fontFace: "Roboto",
    align: pres.AlignH.center,
    rectRadius: 10,
  });

  const equityStoryText =
    "Funding History:\n" +
    company.equityStory.fundingHistory
      .map((f) => `${f.round} (${f.date}) led by ${f.lead}: ${f.amount}`)
      .join("\n");
  slide2.addText(equityStoryText, {
    x: 5.15,
    y: 6,
    w: 2.2,
    h: 0.6,
    fontSize: 10,
    color: "#000000",
    valign: pres.AlignV.top,
    fontFace: "Roboto",
  });
  const currentDeal = `Current Deal: ${company.equityStory.currentDeal.raiseAmount} \nInstrument: ${company.equityStory.currentDeal.instrumentType} \nValuation: ${company.equityStory.currentDeal.valuation}\nUse of funds: ${company.equityStory.currentDeal.useOfFunds.join(", ")}`;

  slide2.addText(currentDeal, {
    x: 7.3,
    y: 6,
    w: 2.4,
    h: 0.6,
    fontSize: 9,
    color: "#000000",
    valign: pres.AlignV.top,
    fontFace: "Roboto",
  });

  console.log("pres", pres);
  const stream = await pres.stream();
  console.log("stream", stream);
  const uint8Array =
    stream instanceof Uint8Array
      ? stream
      : stream instanceof ArrayBuffer
        ? new Uint8Array(stream)
        : typeof stream === "string"
          ? new TextEncoder().encode(stream)
          : new Uint8Array(await stream.arrayBuffer());

  return uint8Array;
};
