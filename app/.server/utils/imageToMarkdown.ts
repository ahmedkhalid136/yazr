import s3 from "@/.server/s3.server";
import {
  encodeImageToBase64,
  formatMarkdown,
  //   getCompletion,
  //   LLMParams,
} from "./imageToMarkdownAi_dep";
// import oai from "@/lib/openai";
import gemini from "@/lib/gemini.server";
import ant from "@/.server/anthropic.server";
import oai from "@/lib/openai.server";

export interface Page {
  content: string;
  contentLength: number;
  page: number;
  status: string;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
}

export default async function imageToMarkdown(
  imageUrl: string,
): Promise<string | undefined> {
  const imageBuffer = await s3.docStoring.get(imageUrl);
  const GraphSystemPrompt = `
    You are an expert Investor and Data Analyst. You will review this image representing a slide of a deck. You will review in great details the content of the graph. If not graph is present, you reply with "No graph".
    You can find line charts, bar charts, pie charts, scatter plots.
    If there is a line or bar chart you will return the following information:
    - the title of the chart
    - the meaning of the chart
    - for each X value, you will return "[X label] [value] - [Y label] [value]"
    - if there is no X value, you will return "[Y label] [value]"
    If there is a pie chart you will return the following information:
    - the title of the chart
    - the meaning of the chart
    - for each slice, you will return "[slice label] [value]"
    - if there is no slice, you will return "No slices"
    If no graph is present, you reply with "No graph". A Table is not a graph.
    Think step by step and reason about the image. Your graph description needs to be accurate and understandable by other people reading it.
    Write the thinking within the tags <thinking> </thinking>. Write your answer in the tags <answer> </answer>
  `;
  const systemPromptForDescriptive = `
  You have perfect vision and pay great attention to details which makes you an expert at translating slides into markdown.
  You must understand and summarize the main points of the page.
  You must include all information on the page. Do not exclude headers, footers, or subtext. Do not invent information.
    Extract the content of the provided slide image. 
    Format the extracted text as Markdown, following these guidelines:
    1. Use appropriate heading levels (#, ##, ###, etc.) to represent the document's structure.
    2. Maintain paragraph separations from the original text.
    3. Use Markdown list formatting (ordered or unordered) for any lists encountered.
    4. Preserve important emphasis such as bold or italics (if present in the original).
    5. Use Markdown quote formatting for any quotations.
  
	Return in markdown format the following information:
	- slide name
	- slide key message including all the main points, the metrics, the text and numerical information presented on the slide, including any percentages, growth rates, financial figures, and statistical data.
	- provide a complete transcription of the whole slide 
  	Think step by step and reason about the content of this slide: I want you to think about the data you are going to write in the answer and make sure it is accurate.
    Write the thinking within the tags <thinking> </thinking>. Write your answer in the tags <answer> </answer>.

    Here is an example of the output:
<thinking>
I am extracting the text from the slide carefully and organizing it into a Markdown structure. I verify the numbers and text to ensure accuracy.
</thinking>


<answer>


Slide Name

Acceleration of “Land” and “Expand” is providing a multiplier effect to our ARR

Slide Key Message
	•	Continuity ARR*: ~60% of YoY growth driven by upsell
	•	Acceleration of land: number of new names signed x2 YoY
	•	Acceleration of expand: each account is upsold by 50–100% YoY

Complete Transcription of the Slide

Header:

	Acceleration of “Land” and “Expand” is providing a multiplier effect to our ARR

Chart Data (in Millions of Euros):
	•	2022: €1.0M
	•	2023: €1.9M
	•	2024: €4.6M
	•	2025: €9.5M

Additional Notes on Chart:
	•	Continuity ARR* ~60% of YoY growth driven by upsell
	•	Clients:
	•	2022 existing clients
	•	2023 new names
	•	2024 new names
	•	2025 new names

Key Accelerators:
	•	Acceleration of land: number of new names signed x2 YoY
	•	Acceleration of expand: each account is upsold by 50–100% YoY

Footer:

	C to sign-off, verbal approval, and scoring phase

Slide Number: 20

</answer>



Another example:
<thinking>  
1. **Understanding the Slide Name:**  
   - The slide does not have an explicit title at the top, but the largest text reads:  
     **"WeeFin, an ambitious fintech on a mission to help you improve your sustainable strategy"**  
   - This suggests the slide is an **"About Us"** or **"Company Overview"** page.  


	2.	Identifying the Key Message:
	•	The slide conveys that WeeFin is a fintech company focused on sustainability and ESG strategies.
	•	It highlights the company’s foundation year (2018), fundraising (€10M in 2023), employee growth, focus on ESG, and expansion plans.
	3.	Extracting Detailed Information from the Slide:
	•	Company Founded: 2018
	•	Funding: Raised +10M€ in 2023 to scale operations.
	•	Employees:
	•	Over 70 employees in total.
	•	55+ employees with specific roles:
	•	38 in product team
	•	22 ESG experts
	•	Investor Focus:
	•	Targets professional investors: Asset Managers (AM), Asset Owners (AO), Wealth Managers, and Banking CIB.
	•	Mission: Democratize sustainable finance and fight greenwashing.
	•	Product Offering:
	•	SaaS ESG connect: Helps businesses manage ESG data, develop sustainability strategies, and collaborate more effectively.
	•	Geographical Expansion:
	•	Blue Dots: Existing WeeFin locations.
	•	Orange Dots: New openings starting in 2023.
	•	Company Branding: The WeeFin logo appears at the bottom right.
	4.	Ensuring Accuracy & Completeness:
	•	Every number, keyword, and concept is included.
	•	No invented or assumed information.
	•	Markdown formatting ensures clarity.

</thinking>  


<answer>  


Company Overview: WeeFin, a Fintech for Sustainable Strategy

Key Message

WeeFin is an ambitious fintech company focused on improving sustainable strategies. Founded in 2018, it has raised over 10M€ in 2023, employs 70+ people, and is expanding across Europe. The company specializes in ESG finance and fights against greenwashing by providing SaaS solutions for professional investors.

Detailed Slide Information

Company Foundation & Growth
	•	Founded: 2018
	•	Raised +10M€ in 2023 to scale the business

Employees & Expertise
	•	70+ employees
	•	55+ employees with specialized profiles:
	•	38 in the product team
	•	22 ESG experts

Investor Focus & Mission
	•	Targets professional investors:
	•	Asset Managers (AM), Asset Owners (AO), Wealth Managers, and Banking CIB
	•	Mission: Democratize sustainable finance and fight against greenwashing

Product Offering: SaaS ESG Connect
	•	Helps businesses manage ESG data and develop sustainability strategies
	•	Enables collaboration around ESG processes

Geographical Expansion
	•	Existing Locations (marked with blue dots)
	•	New Openings starting in 2023 (marked with orange dots)

Company Branding
	•	WeeFin logo at the bottom right

</answer>  

Another example:
<thinking>  
1. **Understanding the Slide Name:**  
   - The largest text on the slide states: **"MARKET SIZE IS OVER €20 BILLION"**, indicating the slide focuses on market opportunity.  
   - The subtext specifies that it refers to **annual expenditure in personalized nutrition and healthy eating services (2026E, global)**.  
   - This suggests the slide is about **Market Size & Growth Potential**.  


	2.	Identifying the Key Message:
	•	The market for personalized nutrition and healthy eating services is massive, exceeding €20 billion.
	•	The industry is expected to grow at a CAGR of ~15% (2022-26E).
	•	The total addressable market (TAM) is €940 billion, but the serviceable addressable market (SAM) is €20+ billion.
	•	Holifya’s expected annual revenues (SOM) to 2026 are projected at €15+ million.
	•	The target customers are 60 million individuals aged 30-60, who are affluent, health-conscious, and living in large cities.
	•	Holifya expects to have ~15K customers by 2026.
	3.	Extracting Detailed Information from the Slide:
	•	TAM (Total Addressable Market): €940 billion
	•	SAM (Serviceable Addressable Market): €20+ billion
	•	SOM (Serviceable Obtainable Market): €15+ million
	•	Growth Rate: CAGR ~15% (2022-26E)
	•	Target Customers:
	•	60 million people purchasing personalized nutrition/nutrigenetics services
	•	Age group: 30-60 years old
	•	Affluent and health-conscious individuals living in large cities
	•	Holifya’s Expected Customers by 2026: ~15K
	•	Source:
	•	Global Wellness Institute Reports
	•	Literature research
	•	Holifya analysis
	•	PRNewswire link provided
	4.	Ensuring Accuracy & Completeness:
	•	All key figures, segments, and growth data are included.
	•	No additional assumptions have been made.
	•	The markdown formatting ensures clarity.

</thinking>  


<answer>  


Market Size & Growth Potential

Key Message

The personalized nutrition and healthy eating services market is over €20 billion, with strong growth potential (~15% CAGR 2022-26E). Holifya aims to capture a share of this market, expecting €15+ million in annual revenues and ~15K customers by 2026.

Detailed Slide Information

Market Size Overview
	•	TAM (Total Addressable Market): €940 billion
	•	SAM (Serviceable Addressable Market): €20+ billion
	•	SOM (Serviceable Obtainable Market / Holifya’s expected revenue): €15+ million

Industry Growth & Trends
	•	CAGR (2022-26E): ~15%

Target Customers
	•	60 million individuals purchasing personalized nutrition/nutrigenetics services
	•	Age range: 30-60 years old
	•	Affluent, health-conscious individuals living in large cities

Holifya’s Business Projection
	•	Expected customers by 2026: ~15K
	•	Projected revenue: €15+ million

Sources
	•	Global Wellness Institute Reports
	•	Literature research & Holifya analysis
	•	PRNewswire: Global Personalized Nutrition Market Report

</answer>  

`;
  const userPrompt = "This is a page of a presentation of the company.";

  // Add Image to request
  const base64Image = await encodeImageToBase64(imageBuffer);

  try {
    const markdownGemini = await gemini.imageChat(
      userPrompt,
      systemPromptForDescriptive,
      base64Image,
      "jpeg",
    );
    const markdownGeminiGraph = await gemini.imageChat(
      userPrompt,
      GraphSystemPrompt,
      base64Image,
      "jpeg",
    );

    console.log("markdownGemini", markdownGemini?.slice(0, 50));
    console.log("markdownGeminiGraph", markdownGeminiGraph?.slice(0, 50));
    const extractAnswer = (markdown: string) => {
      const match = markdown.match(/<answer>(.*?)<\/answer>/s);
      if (match) return match[1];

      const match2 = markdown.split("<answer>")[1];
      if (match2) return match2;
      else return markdown;
    };
    if (!markdownGemini) return undefined;
    const markdownCleaned = extractAnswer(markdownGemini);
    const graphCleaned = extractAnswer(markdownGeminiGraph || "");

    console.log("markdown <> markdownCleaned", markdownCleaned.slice(0, 50));

    const checkResult = await oai.img64Chat(
      `Check the image and read the following comment. Is it correct and comprehensive? Is there any deatils you would add or change?
      If you don't notive any error, reply with "Ok" `,
      `${markdownCleaned} \n ${graphCleaned}`,
      base64Image,
      "gpt-4o",
    );
    return `${markdownCleaned} \n${graphCleaned} \n${checkResult}`;
    // return markdownGemini;
  } catch (error) {
    console.error("Error in imageToMarkdown completion", error);
    return undefined;
  }
}
