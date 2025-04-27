import PptxGenJS from "pptxgenjs";
import db from "@/lib/db.server";
import { z } from "zod";
import { ShapeType } from "@/lib/pptxgenjs";
import { WebEnhancementType } from "@/lib/types";
import { CompanyInput } from "@/lib/typesCompany";

export async function onePagerPPT(
  jobId: string,
  parsedCompanyData: CompanyInput,
  webData?: WebEnhancementType,
  dealTeam: string[] = ["TBD"],
  status: string = "TBD",
): Promise<AsyncIterable<Uint8Array>> {
  try {
    const job = await db.job.queryFromJobId(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    console.log("Building the PPT one pager: ", jobId);

    // Before providing the answer in <answer> tags, think step by step in <thinking> tags and analyze every part of the image.

    if (!parsedCompanyData) {
      throw new Error("generateTemplatedPDF companyData non present...error");
    }
    return await buildPresentation(
      parsedCompanyData,
      dealTeam,
      status,
      webData,
    );
  } catch (error) {
    console.error("Error generating one-pager:", error);
    throw error;
  }
}

const buildPresentation = async (
  company: CompanyInput,
  dealTeam: string[],
  status: string,
  webData?: WebEnhancementType,
): Promise<AsyncIterable<Uint8Array>> => {
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

  // WEB DATAAAA ================================================

  if (webData) {
    try {
      console.log("seconda slide");
      const slide3 = pres.addSlide();
      slide3.addShape(ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.6,
        fill: { color: "#b8860b" },
      });
      slide3.addText("WEB INFORMATION", {
        x: 0.2,
        y: 0.1,
        w: 1.5,
        h: 0.4,
        fontSize: 10,
        bold: true,
        color: "#ffffff",
        align: pres.AlignH.center,
        fontFace: "Roboto",
      });
      // Competitors: \n ${webData.crustData.markets.map(m=>m.competitors.map(c=>c.competitor_website_domains).join(", ")).join("\n")}\n\n
      const web = `The following data comes from web resources: the company webiste, linkedin and crunchbase. \n
${webData.companyName}\n
Website: ${webData.domainName}\n
${
  webData.crustData && webData.crustData.headcount
    ? `
${webData.crustData.headcount.linkedin_headcount ? `Headcount (from Linkedin updated weekly): \n FTE - ${webData.crustData.headcount.linkedin_headcount}, growth YoY: ${webData.crustData.headcount.linkedin_headcount_total_growth_percent.yoy}%, growth 2Y: ${webData.crustData.headcount.linkedin_headcount_total_growth_percent.two_years}, growth QoQ: ${webData.crustData.headcount.linkedin_headcount_total_growth_percent.qoq}%, growth MoM: ${webData.crustData.headcount.linkedin_headcount_total_growth_percent.mom}%.\n\n` : ""}
${webData.crustData.headcount.linkedin_region_metrics ? `Offices regions: \n<10%: ${webData.crustData.headcount.linkedin_region_metrics["0_to_10_percent"]}\n<30%: ${webData.crustData.headcount.linkedin_region_metrics["11_to_30_percent"]}\n<50%: ${webData.crustData.headcount.linkedin_region_metrics["31_to_50_percent"]}\n<70%: ${webData.crustData.headcount.linkedin_region_metrics["51_to_70_percent"]}\n<100%: ${webData.crustData.headcount.linkedin_region_metrics["71_to_100_percent"]}\n\n` : ""}`
    : ""
}
Job openings (from Linkedin updated weekly): \n Open now - ${webData.crustData.job_openings.job_openings_count}, growth 6M: ${webData.crustData.job_openings.job_openings_count_growth_percent?.six_months}%, growth YoY: ${webData.crustData.job_openings.job_openings_count_growth_percent?.yoy}&.\n\n
Funding (from Crunchbase): \n${
        webData.crustData.funding_and_investment.funding_milestones_timeseries
          ? webData.crustData.funding_and_investment.funding_milestones_timeseries
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              )
              .map(
                (f) =>
                  `${new Date(f.date).getFullYear()}/${String(new Date(f.date).getMonth() + 1).padStart(2, "0")} - $${Math.round(f.funding_milestone_amount_usd / 1000)}k`,
              )
              .join("\n")
          : "No funding data found"
      }  \n\n
Investors (from Crunchbase): \n${webData.crustData.funding_and_investment.crunchbase_investors_info_list.map((i) => `${i.name} - ${i.type}`).join("\n")}\n\n
    `;

      const founders = webData.crustProfiles.founders
        .map((p) => [
          {
            text: `${p.name} - ${p.title}:`,

            options: {
              hyperlink: {
                url: p.linkedin_profile_url,
                tooltip: "Linkedin " + p.linkedin_profile_url,
              },
              bold: true,
            },
          },
          {
            text: p.past_employers
              ? p.past_employers
                  .sort(
                    (a, b) =>
                      new Date(a.start_date).getTime() -
                      new Date(b.start_date).getTime(),
                  )
                  .map(
                    (e) =>
                      `${new Date(e.start_date).getFullYear()}-${new Date(e.end_date).getFullYear()}: ${e.employee_title}@${e.employer_name}`,
                  )
                  .join(", ")
                  .slice(0, 150)
              : "No past employers data found",
          },
          { text: "\n" },
        ])
        .flat();

      const news = `\n\nLatest news about the company: \n ${
        webData.crustData.news_articles
          ? webData.crustData.news_articles
              .sort(
                (a, b) =>
                  new Date(b.article_publish_date).getTime() -
                  new Date(a.article_publish_date).getTime(),
              )
              .map(
                (n) =>
                  `${n.article_title} - ${new Date(n.article_publish_date).getFullYear()}/${String(new Date(n.article_publish_date).getMonth() + 1).padStart(2, "0")} `,
              )
              .join("\n")
          : "No news data found"
      }\n\n`;
      // Product info from the website, summed up with Gemini: ${webData.productInfo}\n\n\n

      // slide3.addText([{ text: web }, ...founders.flat()], {
      slide3.addText(web, {
        x: 0.2,
        y: 0.65,
        w: 4.5,
        h: 6,
        fontSize: 8,
        color: "#000000",
        valign: pres.AlignV.top,
        fontFace: "Roboto",
      });
      slide3.addText(
        [{ text: "Founders info: \n" }, ...founders, { text: news }],
        {
          x: 5,
          y: 0.65,
          w: 4.5,
          h: 6,
          fontSize: 8,
          color: "#000000",
          valign: pres.AlignV.top,
          fontFace: "Roboto",
        },
      );
      console.log("finito di aggiungere");
    } catch (error) {
      console.log("Error in slide 3", error);
    }
  }
  // // ========================================
  // // Slide 3: Investment Thesis and Next Steps
  // // ========================================
  // let slide3 = pres.addSlide();
  // slide3.addShape(ShapeType.rect, {
  //   x: 0,
  //   y: 0,
  //   w: 10,
  //   h: 1.5,
  //   fill: { color: "#b8860b" },
  // });
  // slide3.addText("INVESTMENT THESIS", {
  //   x: 0.5,
  //   y: 0.5,
  //   w: 9,
  //   h: 1,
  //   fontSize: 32,
  //   bold: true,
  //   color: "FFFFFF",
  //   align: pres.AlignH.center,
  // });
  // // Two-column layout for "What we like" (left) and "Unknown and risks" (right)
  // slide3.addShape(ShapeType.rect, {
  //   x: 0.5,
  //   y: 2,
  //   w: 4,
  //   h: 0.5,
  //   fill: { color: "#90ee90" },
  // });
  // slide3.addText("What we like", {
  //   x: 0.5,
  //   y: 2,
  //   w: 4,
  //   h: 0.5,
  //   fontSize: 14,
  //   bold: true,
  //   color: "000000",
  //   align: pres.AlignH.center,
  // });
  // let whatWeLikeText = company.whatWeLike
  //   .map((pt) => "• " + pt)
  //   .join("\n");
  // slide3.addText(whatWeLikeText, {
  //   x: 0.5,
  //   y: 2.6,
  //   w: 4,
  //   h: 2,
  //   fontSize: 10,
  //   color: "#000000",
  // });
  // slide3.addShape(ShapeType.rect, {
  //   x: 5.5,
  //   y: 2,
  //   w: 4,
  //   h: 0.5,
  //   fill: { color: "#ffe5b4" },
  // });
  // slide3.addText("Unknown and risks", {
  //   x: 5.5,
  //   y: 2,
  //   w: 4,
  //   h: 0.5,
  //   fontSize: 14,
  //   bold: true,
  //   color: "000000",
  //   align: pres.AlignH.center,
  // });
  // let risksText = company.risksAndUnknowns
  //   .map((risk) => "• " + risk)
  //   .join("\n");
  // slide3.addText(risksText, {
  //   x: 5.5,
  //   y: 2.6,
  //   w: 4,
  //   h: 2,
  //   fontSize: 10,
  //   color: "#000000",
  // });
  // // Next steps section
  // slide3.addShape(ShapeType.rect, {
  //   x: 0.5,
  //   y: 5,
  //   w: 9,
  //   h: 0.5,
  //   fill: { color: "#d3d3d3" },
  // });
  // slide3.addText("Next steps", {
  //   x: 0.5,
  //   y: 5,
  //   w: 9,
  //   h: 0.5,
  //   fontSize: 14,
  //   bold: true,
  //   color: "000000",
  //   align: pres.AlignH.center,
  // });
  // let nextStepsText = company.nextSteps
  //   .map((step) => "• " + step)
  //   .join("\n");
  // slide3.addText(nextStepsText, {
  //   x: 0.5,
  //   y: 5.6,
  //   w: 9,
  //   h: 1.5,
  //   fontSize: 10,
  //   color: "#000000",
  // });

  // Save the PPTX file (the file name here uses the company name)
  // pres.writeFile({ fileName: `${company.name}_Presentation.pptx` });

  const stream = await pres.stream();
  const uint8Array =
    stream instanceof Uint8Array
      ? stream
      : stream instanceof ArrayBuffer
        ? new Uint8Array(stream)
        : typeof stream === "string"
          ? new TextEncoder().encode(stream)
          : new Uint8Array(await stream.arrayBuffer());

  return (async function* () {
    yield uint8Array;
  })();
};
