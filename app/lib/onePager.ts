import { launch } from "puppeteer-core";
import db from "@/.server/electroDb.server";

import oai from "@/.server/openai.server";
import { z } from "zod";
import ant from "@/.server/anthropic.server";
import { CompanyInput, CompanyInputSchema } from "@/lib/typesCompany";
const LOCAL_CHROUMIUM_PATH =
  "/Applications/Chromium.app/Contents/MacOS/Chromium";

export async function generateHTML(
  company: CompanyInput,
  dealTeam: string[] = [""],
  companyId: string = "",
): Promise<string> {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <style>
      section {
        margin: 0;
        height: 780px;
        width: 1024px;
        overflow: hidden;
        position: relative;
        border: 1px solid black;
        font-size: 12px;
      }
      .page-wrapper {
        display: flex;
        flex-direction: row;
        background-color: white;
        height: 100%;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        color: #333;
      }

      .content {
        margin-left: 40px;
        padding-top: 100px;
      }
      .header {
        font-size: 32px;
        color: white;
        background-color: #b8860b;
        padding: 15px 40px;
        text-transform: none;
        position: relative;
        font-weight: bold;
      }
      .arrow {
        position: absolute;
        left: 40%;
        top: 40%;
        transform: translateY(-50%);
        color: white;
        font-size: 124px;
        color: #d3d3d3;
      }
    </style>
  </head>
  <body>
    <section>
      <div class="page-wrapper">
        <div class="sidebar" style="width: 260px">
          <div
            style="height: 100%; padding-top: 220px; background-color: white"
          >
            <div
              style="
                font-weight: bold;
                height: 100px;
                background-color: #b8860b;
                position: relative;
              "
            >
              <div class="arrow">›</div>
            </div>
            <div
              style="
                background-color: #d3d3d3;
                height: 100%;
                border-right: 2px solid white;
                border-top: 2px solid white;
              "
            ></div>
          </div>
        </div>
        <div style="width: 100%">
          <div
            style="
              height: 100%;
              padding-top: 200px;
              background-color: white;
              position: relative;
            "
          >
            <div
              style="
                position: absolute;
                top: 180px;
                right: 40px;
                font-size: 24px;
                font-weight: bold;
              "
            >
              BlackFin <span style="color: #ffa500">Tech</span>
            </div>
            <div
              style="
                font-weight: bold;
                height: 100px;
                background-color: #b8860b;
                color: white;
                font-size: 38px;
                padding-left: 40px;
                border-left: 4px solid white;
              "
            >
              <h1 style="margin-top: 20px; padding-top: 16px">${
                company.name
              }</h1>
            </div>
            <div
              style="
                background-color: white;
                height: 100%;
                border-left: 3px solid #333;
              "
            ></div>
          </div>
        </div>
      </div>
    </section>
    <div style="page-break-before: always"></div>
    <section>
      <div class="page-wrapper">
        <div style="width: 100%">
          <div style="height: 100%; background-color: white">
            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Top Stats Bar                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div
              style="
                background-color: #b8860b;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: auto;
                margin-bottom: 6px;
                width: 100%;
              "
            >
              <div
                style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  width: 100%;
                  color: white;
                  padding: 24px 40px;
                "
              >
                <div style="font-weight: bold; width:150px; text-align:center">${
                  company.industry
                }
                </div>
                <div style="font-weight: bold; width:150px; text-align:center">${
                  company.kpis.fteCount
                } FTEs
                </div>
                <div style="text-align: center; width:150px; text-align:center background-color: white; padding: 10px 20px; color:black; font-weight: bold;">
                  ${company.name}
                </div>
                <div style="text-align: center; width:150px; text-align:center">
                  <div style="font-weight: bold">${
                    company.kpis.revenueMetrics.arr
                  } ARR</div>
                </div>
                <div style="text-align: center; width:150px; text-align:center">
                  ${company.highlights.country}
                  <div style="font-weight: bold">${
                    company.highlights.foundingYear
                  }</div>
                </div>
              </div>
            </div>

            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Status Bar                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div
              style="
                background-color: #fff8dc;
                padding: 15px 20px;
              "
            >
              <div style="font-weight: bold">
                Status:
                <span style="border: 2px dashed red; padding: 2px 6px">TBD</span>
                - Deal Team: TBD
              </div>
            </div>

            
            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Two Column Layout                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div style="display: flex; gap: 6px; padding: 12px">
              <!-- ------------------------------------------------------------------------------------------------ -->
              <!--                                    Left Column                                                  -->
              <!-- ------------------------------------------------------------------------------------------------ -->
              <div style="flex: 1">
                <div
                  style="
                    background-color: #ffe4b5;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 0px;
                  "
                >
                  Business Description
                </div>
                <ul style="list-style-type: circle; padding-left: 20px">
                  ${company.overview}
                </ul>
                <div
                  style="
                    background-color: #ffe4b5;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 6px;
                  "
                >
                  Product
                </div>
                <ul style="list-style-type: circle; padding-left: 20px; margin: 0; padding-bottom: 10px;">
                  <li style="margin-bottom: 6px"><span style="font-weight: bold; color:#b8860b">Description:</span> ${
                    company.product.descriptionAndVision
                  }</li>
                  <li style="margin-bottom: 6px"><span style="font-weight: bold; color:#b8860b">Main Features:</span> ${
                    company.product.mainFeatures
                  }</li>
                  <li style="margin-bottom: 6px"><span style="font-weight: bold; color:#b8860b">Target Customers:</span> ${
                    company.product.targetCustomers
                  }</li>
                  <li style="margin-bottom: 6px"><span style="font-weight: bold; color:#b8860b">Business Model:</span> ${
                    company.product.businessModel.description
                  }</li>
                  <li style="margin-bottom: 6px"><span style="font-weight: bold; color:#b8860b">GTM Strategy:</span> ${
                    company.product.gtmStrategy
                  }</li>
                  <li style="margin-bottom: 6px"><span style="font-weight: bold; color:#b8860b">Competitors:</span> ${company.product.competitors
                    .map((c) => c)
                    .join(", ")}</li>
                </ul>
                <div
                  style="
                    background-color: #ffe4b5;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 6px;
                  "
                >
                  Team
                </div>
                <ul style="list-style-type: circle; padding-left: 20px; margin: 0; padding-bottom: 10px;">
                   ${company.team
                     .map(
                       (t) =>
                         `<li style="margin-bottom: 0px"> ${t.name} - ${t.role}, ${t.background}</li>`,
                     )
                     .join("")}
                </ul>
              </div>

              <!-- ------------------------------------------------------------------------------------------------ -->
              <!--                                    Right Column                                                  -->
              <!-- ------------------------------------------------------------------------------------------------ -->
              <div style="flex: 1">
                <div
                  style="
                    background-color: #ffe4b5;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 0px;
                  "
                >
                  KPIs
                </div>
                <table style="w4dth: 100%; border-collapse: collapse; margin-bottom: 2px">

                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd; width: 30%"><strong>Clients:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">Total: ${
                      company.kpis.clientMetrics.totalClients
                    } | Paying: ${company.kpis.clientMetrics.payingClients}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>ARR:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">Current: ${
                      company.kpis.revenueMetrics.arr
                    } | Growth: ${company.kpis.revenueMetrics.arrGrowth}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>cARR:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">Current: ${
                      company.kpis.revenueMetrics.carr
                    } | Growth: ${company.kpis.revenueMetrics.carrGrowth}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>Contract:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">ACV: ${
                      company.kpis.contractMetrics.acv
                    } | Length: ${
                      company.kpis.contractMetrics.averageContractLength
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>Margins:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">Gross: ${
                      company.kpis.financialMetrics.grossMargin
                    } | EBITDA: ${
                      company.kpis.financialMetrics.ebitdaMargin
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>Retention:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">NRR: ${
                      company.kpis.financialMetrics.nrr
                    } | Churn: ${company.kpis.financialMetrics.churn}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>Burn:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">Monthly: ${
                      company.kpis.financialMetrics.cashBurn
                    } | Multiple: ${
                      company.kpis.financialMetrics.burnMultiple
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>Rule of 40:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">${
                      company.kpis.financialMetrics.ruleOf40
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>Sales Metrics:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">CAC: ${
                      company.kpis.salesMetrics.cac
                    } | Cycle: ${
                      company.kpis.salesMetrics.salesCycle
                    } | LTV/CAC: ${company.kpis.salesMetrics.ltvCac} | Payback: ${
                      company.kpis.salesMetrics.cacPayback
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 10px; border: 1px solid #ddd"><strong>FTEs:</strong></td>
                    <td style="padding: 4px 10px; border: 1px solid #ddd">${
                      company.kpis.fteCount
                    }</td>
                  </tr>
                </table>

                <div>
                  <strong>Current Clients:</strong> ${company.clients.join(
                    ", ",
                  )}
                </div>

                <div
                  style="
                    background-color: #ffe4b5;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin: 12px 0 12px 0;
                  "
                >
                  Equity Story
                </div>
                <div style="display: flex; flex-direction: row; gap: 12px">
                <div style="margin-bottom: 15px">
                  <strong>Funding History:</strong>
                  <ul style="list-style-type: circle; padding-left: 20px; margin-top: 8px">
                    ${company.equityStory.fundingHistory
                      .map(
                        (funding) => `
                      <li style="margin-bottom: 4px">
                        ${funding.round} (${funding.date}) led by ${funding.lead}: ${funding.amount}
                      </li>
                    `,
                      )
                      .join("")}
                  </ul>
                   <div>
                  <strong>Current Deal:</strong>
                  <ul style="list-style-type: circle; padding-left: 20px; margin-top: 8px">
                    <li style="margin-bottom: 4px">Raise Amount: ${
                      company.equityStory.currentDeal.raiseAmount
                    }</li>
                    <li style="margin-bottom: 4px">Instrument: ${
                      company.equityStory.currentDeal.instrumentType
                    }</li>
                    <li style="margin-bottom: 4px">Valuation: ${
                      company.equityStory.currentDeal.valuation
                    }</li>
                    <!-- 
                    <li style="margin-bottom: 4px">Use of Funds:
                      <ul style="list-style-type: disc; padding-left: 20px; margin-top: 4px">
                        ${company.equityStory.currentDeal.useOfFunds
                          .map(
                            (use) =>
                              `<span style="margin-bottom: 4px">${use}</span>`,
                          )
                          .join(", ")}
                      </ul>
                    </li> -->
                  </ul>
                </div>
                </div>

                <div style="margin-bottom: 15px">
                  <strong>Current Shareholders:</strong>
                  <ul style="list-style-type: circle; padding-left: 20px; margin-top: 8px">
                    ${company.equityStory.currentShareholders
                      .map(
                        (shareholder) => `
                      <li style="margin-bottom: 4px">
                        ${shareholder.name}: ${shareholder.ownership}%
                      </li>
                    `,
                      )
                      .join("")}
                  </ul>
                </div>
                </div>

               
              </div>
            </div>

            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Footer                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div style="margin-top: 20px; padding: 0 20px">
              Note/Source:
              <a href="https://www.yazr.ai/business/${companyId}">
              <span style="background-color: yellow">(1)</span>
              </a>
            </div>
            <div style="margin-top: 10px; padding: 0 20px">
                     <div
              style="

                top: 180px;
                right: 40px;
                font-size: 24px;
                font-weight: bold;
              "
            >
              BlackFin <span style="color: #ffa500">Tech</span>
            </div>
              <span style="float: right; font-weight: bold">2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
          
  </body>
</html>`;
  const restOfOnePager = `
    <div style="page-break-before: always"></div>

    <section>
      <div class="page-wrapper">
        <div style="width: 100%">
          <div style="height: 100%; background-color: white">
            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Header                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div
              style="
                background-color: #b8860b;
                padding: 24px 40px;
                color: white;
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 40px;
              "
            >
              KPIs (ENTERPRISE SAAS)
            </div>

            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Three Column Layout                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div
              style="display: flex; gap: 20px; padding: 20px; margin-top: 40px"
            >
              <!-- Maturity and traction Column -->
              <div style="flex: 1">
                <div style="text-align: center; margin-bottom: 20px">
                  <img
                    src="chart-growth.png"
                    alt="Growth Chart"
                    style="width: 60px; height: 60px"
                  />
                </div>
                <div
                  style="
                    background-color: #ffe4b5;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 6px;
                    text-align: center;
                  "
                >
                  Maturity and traction
                </div>
                <table style="width: 100%; border-collapse: collapse">
                  <tr style="background-color: #b8860b; color: white">
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      Live ARR
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      ARR growth
                    </th>
                  </tr>
                  <tr style="background-color: #f5f5f5">
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.revenueMetrics.arr}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.revenueMetrics.arrGrowth}
                    </td>
                  </tr>
                </table>

                <table
                  style="
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                  "
                >
                  <tr style="background-color: #b8860b; color: white">
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      ARR EoY forecast
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      FTEs
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      FTE growth
                    </th>
                  </tr>
                  <tr style="background-color: #f5f5f5">
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.revenueMetrics.carr}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.fteCount}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.revenueMetrics.carrGrowth}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- ------------------------------------------------------------------------------------------------ -->
              <!--                                    Unit economics Column                                                  -->
              <!-- ------------------------------------------------------------------------------------------------ -->
              <div style="flex: 1">
                <div style="text-align: center; margin-bottom: 20px">
                  <img
                    src="money-stack.png"
                    alt="Money Stack"
                    style="width: 60px; height: 60px"
                  />
                </div>
                <div
                  style="
                    background-color: #ffe4b5;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 6px;
                    text-align: center;
                  "
                >
                  Unit economics
                </div>
                <table style="width: 100%; border-collapse: collapse">
                  <tr style="background-color: #b8860b; color: white">
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      GM
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      Burn
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      ACV
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      Churn
                    </th>
                  </tr>
                  <tr style="background-color: #f5f5f5">
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.financialMetrics.grossMargin}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.financialMetrics.cashBurn}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.contractMetrics.acv}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.financialMetrics.churn}
                    </td>
                  </tr>
                </table>

                <table
                  style="
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                  "
                >
                  <tr style="background-color: #b8860b; color: white">
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      NRR
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      Burn multiple
                    </th>
                    <th
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid white;
                      "
                    >
                      Rule of 40
                    </th>
                  </tr>
                  <tr style="background-color: #f5f5f5">
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.financialMetrics.nrr}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.financialMetrics.burnMultiple}
                    </td>
                    <td
                      style="
                        padding: 10px;
                        text-align: center;
                        border: 1px solid #ddd;
                      "
                    >
                      ${company.kpis.financialMetrics.ruleOf40}
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Sales efficiency Section                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div style="padding: 20px; margin-top: 40px">
              <div style="text-align: center; margin-bottom: 20px">
                <img
                  src="sales-icon.png"
                  alt="Sales Icon"
                  style="width: 60px; height: 60px"
                />
              </div>
              <div
                style="
                  background-color: #ffe4b5;
                  padding: 8px 15px;
                  font-weight: bold;
                  margin-bottom: 15px;
                  text-align: center;
                "
              >
                Sales efficiency
              </div>
              <table style="width: 100%; border-collapse: collapse">
                <tr style="background-color: #b8860b; color: white">
                  <th
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid white;
                    "
                  >
                    CAC
                  </th>
                  <th
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid white;
                    "
                  >
                    Sales cycles
                  </th>
                  <th
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid white;
                    "
                  >
                    LTV/CAC
                  </th>
                  <th
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid white;
                    "
                  >
                    CAC payback
                  </th>
                  <th
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid white;
                    "
                  >
                    Magic number
                  </th>
                </tr>
                <tr style="background-color: #f5f5f5">
                  <td
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid #ddd;
                    "
                  >
                    ${company.kpis.salesMetrics.cac}
                  </td>
                  <td
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid #ddd;
                    "
                  >
                    ${company.kpis.salesMetrics.salesCycle}
                  </td>
                  <td
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid #ddd;
                    "
                  >
                    ${company.kpis.salesMetrics.ltvCac}
                  </td>
                  <td
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid #ddd;
                    "
                  >
                    ${company.kpis.salesMetrics.cacPayback}
                  </td>
                  <td
                    style="
                      padding: 10px;
                      text-align: center;
                      border: 1px solid #ddd;
                    "
                  >
                    ${company.kpis.salesMetrics.cacPayback}
                  </td>
                </tr>
              </table>
            </div>

            <!-- ------------------------------------------------------------------------------------------------ -->
            <!--                                    Footer                                                  -->
            <!-- ------------------------------------------------------------------------------------------------ -->
            <div style="margin-top: 40px; padding: 0 20px">
              <img
                src="blackfin-tech-logo.png"
                alt="BlackFin Tech"
                style="height: 30px"
              />
              <span style="float: right; font-weight: bold">3</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div style="page-break-before: always"></div>
    <section>
      <div class="page-wrapper">
        <div style="width: 100%">
          <div style="height: 100%; background-color: white">
            <!-- Header -->
            <div
              style="
                background-color: #b8860b;
                padding: 24px 40px;
                color: white;
                font-size: 32px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 40px;
              "
            >
              INVESTMENT THESIS
            </div>

            <!-- Two Column Layout -->
            <div style="display: flex; gap: 40px; padding: 20px">
              <!-- Left Column - What we like -->
              <div style="flex: 1">
                <div
                  style="
                    background-color: #90ee90;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 6px;
                    text-align: center;
                  "
                >
                  What we like
                </div>
                <ul style="list-style-type: circle; padding-left: 20px">
                  ${company.whatWeLike
                    .map(
                      (point) => `
                    <li style="margin-bottom: 15px">
                      ${point}
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>

              <!-- Right Column - Unknown and risks -->
              <div style="flex: 1">
                <div
                  style="
                    background-color: #ffe5b4;
                    padding: 8px 15px;
                    font-weight: bold;
                    margin-bottom: 4px;
                    margin-top: 6px;
                    text-align: center;
                  "
                >
                  Unknown and risks
                </div>
                <ul style="list-style-type: circle; padding-left: 20px">
                  ${company.risksAndUnknowns
                    .map(
                      (risk) => `
                    <li style="margin-bottom: 15px">
                      ${risk}
                    </li>
                  `,
                    )
                    .join("")}
                </ul>
              </div>
            </div>

            <!-- Next steps Section -->
            <div style="padding: 20px; margin-top: 40px">
              <div
                style="
                  background-color: #d3d3d3;
                  padding: 8px 15px;
                  font-weight: bold;
                  margin-bottom: 15px;
                  text-align: center;
                "
              >
                Next steps
              </div>
              <ul style="list-style-type: circle; padding-left: 20px">
                ${company.nextSteps
                  .map(
                    (step) => `
                  <li style="margin-bottom: 15px">
                    ${step}
                  </li>
                `,
                  )
                  .join("")}
              </ul>
            </div>

            <!-- Footer -->
            <div style="margin-top: 40px; padding: 0 20px">
              <img
                src="blackfin-tech-logo.png"
                alt="BlackFin Tech"
                style="height: 30px"
              />
              <span style="float: right; font-weight: bold">5</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </body>
</html>`;
}

async function generateTemplatedPDF(company: CompanyInput): Promise<Buffer> {
  const isLambda = process.env.DEV !== "true";

  const executablePath = await chromium.executablePath();

  const browser = await launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: isLambda ? executablePath : LOCAL_CHROUMIUM_PATH,

    headless: true,
  });
  console.log("browser", browser);
  try {
    // Generate HTML content
    const html = await generateHTML(company);
    // console.log("html", html);
    // Create new page and set content
    const page = await browser.newPage();
    // console.log("page", page);

    // Set a reasonable timeout and use a more reliable loading strategy
    await page.setDefaultNavigationTimeout(30000);
    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });

    // Add a small delay to ensure styles are applied
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Generate PDF
    console.log("Generating PDF...");
    const pdfBuffer = await page.pdf({
      height: "780px",
      width: "1024px",
      printBackground: true,
      preferCSSPageSize: false,
    });

    console.log(
      "Raw PDF buffer:",
      typeof pdfBuffer,
      pdfBuffer instanceof Buffer,
    );

    // Convert to Buffer if needed
    const finalBuffer = Buffer.isBuffer(pdfBuffer)
      ? pdfBuffer
      : Buffer.from(pdfBuffer);

    console.log("Final buffer size:", finalBuffer.length, "bytes");
    if (finalBuffer.length === 0) {
      console.error("PDF generation failed: Empty buffer");
      throw new Error("PDF generation failed");
    }

    return finalBuffer;
  } catch (error) {
    console.error("Error generating one-pager:", error);
    await browser.close();

    throw error;
  } finally {
    await browser.close();
  }
}

export async function onePager(
  jobId: string,
  companyText: string,
): Promise<Buffer> {
  try {
    const job = await db.job.queryFromJobId(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    console.log("job", job);

    // Before providing the answer in <answer> tags, think step by step in <thinking> tags and analyze every part of the image.

    const companyData = await ant.textChat(
      companyText,
      `As our Investor Advisor, analyze this documents and prepare a company profile. Parse this data into the following object. 
      You have perfect analytical abilities and pay great attention to detail which makes you an expert reporting.
      When a fields does not present an answer or you are not sure, put "n/a".
      Before answering in <answer> tags, think step by step in <thinking> tags and analyze every question and answer.
      The format is: 
      0. Highlights: Segment (e.g., InsurTech Software), # of FTEs, ARR or CARR (including the period), Growth rate, Countries of operation, Year of founding
      1. Overview (2-3 sentences overview)
      2. Product: 
        1). Description + Vision
        2). Main features
        3). Target customers 
        4). Business model (including pricing details, % fee)
        5). GTM / Distribution model
        6). Competitors (normally shown as logos in the deck, but give me the list of all names menioned)
      3. Team / Founders
      4. KPIs (for each of KPIs below include also the period/date it is referring to): 
        1). # of clients, # of paying clients 
        2). Revenue (ARR, cARR), Revenue growth (ARR growth, cARR growth)
        3). ACV, Average contract length (# years)
        4). Gross Margin, EBITDA margin
        5). NRR, Churn (show separately logo chirn vs ARR churn, if available)
        6). Cash Burn, Burn multiple 
        7). Rule of 40
        8). CAC, Sales cycle, LTV/CAC, CAC payback 
        9). Magic number (net new ARR / S&M spending)
        10). FTEs
        11). Time to implement solution 
        12). ARR / country (main countries) 
      5. Current clients (normally shown as logos in the deck, but give me the list of all names menioned)
      6. Equity story
        1). History of fund-raising rounds
        2). Current list of shareholders
        3). Current deal: how much they are raising, instrument type, valuation, use of funds
      `,
    );

    const parsedCompanyData = await oai.textChat(
      `
      You have perfect analytical abilities and pay great attention to detail which makes you an expert parser. Use the text included in the <answer> tags to parse the data into the JSON schema.
      `,
      companyData,
      "BlackFin Capital",
      CompanyInputSchema,
      "CompanyInput",
    );

    if (!parsedCompanyData) {
      throw new Error("generateTemplatedPDF companyData non present...error");
    }
    return await generateTemplatedPDF(JSON.parse(parsedCompanyData));
  } catch (error) {
    console.error("Error generating one-pager:", error);
    throw error;
  }
}

export const exampleCompanyData: CompanyInput = {
  name: "Weefin",
  industry: "Financial Services",
  highlights: {
    segment: "ESG Data Management SaaS",
    fteCount: 80,
    arr: "€4m",
    growth: "100% YoY",
    country: "France",
    foundingYear: 2018,
  },
  overview:
    "Weefin is an ESG data management SaaS platform helping large asset managers with regulatory compliance and ESG portfolio tracking.",
  product: {
    descriptionAndVision:
      "Weefin helps asset managers build, track, and audit ESG KPIs in investment portfolios of publicly listed companies for regulatory compliance.",
    mainFeatures: [
      "ESG data aggregation",
      "Portfolio tracking",
      "Regulatory compliance reporting",
      "ESG KPI management",
    ],
    targetCustomers: [
      "Large asset managers",
      "Investment firms",
      "Financial institutions",
    ],
    businessModel: {
      description: "Enterprise SaaS",
      pricing: "Based on AuM and number of modules",
      feeStructure: "Annual subscription with tier-based pricing",
    },
    gtmStrategy: "Direct enterprise sales with focus on large asset managers",
    competitors: ["Legacy internal solutions", "Generic ESG data providers"],
  },
  team: [
    {
      name: "CEO Name",
      role: "CEO & Co-founder",
      background: "Ex-Financial Services, 15 years experience",
    },
    {
      name: "CTO Name",
      role: "CTO & Co-founder",
      background: "Ex-Financial Services, 15 years experience",
    },
  ],
  kpis: {
    clientMetrics: {
      totalClients: 10,
      payingClients: 8,
    },
    revenueMetrics: {
      arr: "€4m",
      carr: "€5m",
      arrGrowth: "100%",
      carrGrowth: "80%",
    },
    contractMetrics: {
      acv: "€500k",
      averageContractLength: "3 years",
    },
    financialMetrics: {
      grossMargin: "63%",
      ebitdaMargin: "-40%",
      nrr: "110%",
      churn: "0%",
      cashBurn: "€450k monthly",
      burnMultiple: "1.2",
      ruleOf40: "45",
    },
    salesMetrics: {
      cac: "€120k",
      salesCycle: "10-12 months",
      ltvCac: "5x",
      cacPayback: "18 months",
    },
    fteCount: 80,
  },
  clients: ["Generali", "AXA IM", "Fidelity"],
  equityStory: {
    fundingHistory: [
      {
        round: "Seed",
        date: "Jun-22",
        amount: "€2m",
        lead: "Sidekick",
      },
      {
        round: "Series A",
        date: "Nov-23",
        amount: "n/a",
        lead: "Blackstone",
      },
    ],
    currentShareholders: [
      { name: "CEO", ownership: 42 },
      { name: "Blackstone", ownership: 17 },
      { name: "Sidekick", ownership: 21 },
      { name: "Crystal Towers", ownership: 5 },
      { name: "ESOP", ownership: 12 },
      { name: "Others", ownership: 3 },
    ],
    currentDeal: {
      raiseAmount: "€15m",
      instrumentType: "Primary equity",
      valuation: "€100m post-money",
      useOfFunds: [
        "International expansion",
        "Product development",
        "Team growth",
      ],
    },
  },
  status: "New opportunity",
  dealTeam: ["Julien", "Chloé"],
  whatWeLike: [
    "Unique product and differentiated positioning on its target market (large AMs)",
    "Strong commercial performance since Series A with flagship RFPs won",
    "Highly positive customer feedback, 0 churn",
    "Clear shift upmarket since Series A",
    "Well-balanced team with key Enterprise Sales talent",
    "Positive traction in the UK market",
  ],
  risksAndUnknowns: [
    "Growth may plateau once all Tier 1 asset managers are equipped",
    "Mid-sized market (€500m) for large, publicly listed asset managers",
    "Regulatory changes could impact urgency of adoption",
  ],
  nextSteps: [
    "Pipeline session & access to numbers",
    "Validate 80-100% YoY growth rate sustainability",
  ],
};
