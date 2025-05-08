# Yazr

A platform allowing users (primarily investors) to create and manage company profiles, enriched with external data and user-uploaded documents, enabling company benchmarking through a chat interface.

## Overview

This platform provides a central dashboard for managing company information. Key functionalities include:

- **Company Profile Creation:** Users can initiate a new company profile. The system automatically pre-fills information using web scraping and the Custdata API (assuming this is an external API).
- **Document Enrichment:** Users can upload documents (e.g., reports, financials) related to a company. These documents are processed and used to further enrich the company profile.
- **Automated Document Ingestion (Future):** Planned integration with SharePoint and Google Drive will allow automatic crawling and uploading of relevant documents, eliminating manual uploads.
- **Chat Interface:** A chat feature allows users to query the system about company profiles and the content of the uploaded documents (after parsing).
- **Benchmarking:** The core purpose is to enable investors to compare different companies using the comprehensive data aggregated within the platform, including information previously siloed in various documents.

## Product Requirements Document (PRD) - High Level

**Goal:** To create a platform that aggregates company data from multiple sources (API, web, documents) and allows investors to easily query and benchmark companies.

**Key Features:**

1.  **User Authentication & Authorization:** Secure login for users. (Implicit requirement)
2.  **Dashboard:** Central view for managing companies and accessing features.
3.  **Company Profile Management:**
    - Create new company profiles.
    - Pre-fill profiles using Custdata API and web scraping.
    - View and edit existing company profiles.
4.  **Document Management:**
    - Manual document upload per company.
    - Document parsing (original format to structured JSON).
    - Profile updates triggered by new document uploads.
    - _(Future)_ Automated document ingestion from SharePoint/Google Drive.
5.  **Chat/Query Interface:**
    - Natural language interface to ask questions about companies and documents.
    - Retrieval of company profiles and parsed document content.
6.  **Benchmarking Capabilities:** Ability to compare multiple companies based on aggregated data. (Specific comparison features need definition).

**Non-Functional Requirements:**

- **Accuracy:** We are handling financial data, and we care more about accuracy than saving money and time.
- **Scalability:** Handle a growing number of users, companies, and documents.
- **Security:** Protect sensitive company and user data.
- **Performance:** Fast data retrieval and chat responses.
- **Usability:** Intuitive interface for non-technical users.

## Tech Stack & Dependencies

This project is built using the following core technologies and libraries (based on `package.json`):

- **Framework:** Remix (`@remix-run/*`)
- **Backend Runtime:** Node.js (`>=20.0.0`)
- **Infrastructure/Deployment:** SST (`sst`) - chekc the file sst.config.ts and the folder Stack
- **Database:** AWS DynamoDB (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `dynamodb-toolbox`, `electrodb`) I built a simple library to handle create/update/delete/get in /app/lib/db.ts
- **File Storage:** AWS S3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) I built a simple library to handle create/update/delete/get in /app/lib/s3.ts
- **AI/LLM:** Anthropic SDK (`@anthropic-ai/sdk`), Google Generative AI (`@google/generative-ai`), OpenAI (`openai`) I build a horrible library to handle create in /app/lib/ai.ts
- **UI Components:** Radix UI (`@radix-ui/*`), Shadcn UI (implied by `components.json`, `tailwind.config.ts`, `clsx`, `tailwind-merge`)
- **Styling:** Tailwind CSS (`tailwindcss`, `autoprefixer`, `postcss`)
- **Frontend State/Logic:** React (`react`, `react-dom`)
- **Authentication:** OpenAuth (`@openauthjs/openauth`)
- **Document Processing:** pdf-lib (`pdf-lib`), pdf2pic (`pdf2pic`), pdfkit (`pdfkit`), mailparser (`mailparser`), marked (`marked`), pptxgenjs (`pptxgenjs`), libreoffice-convert (`libreoffice-convert`), Puppeteer (`puppeteer-core`, `@sparticuz/chromium`) (likely for web scraping/PDF generation)
- **Utilities:** Zod (`zod`), date-fns (`date-fns`), nanoid (`nanoid`), fs-extra (`fs-extra`), mime-types (`mime-types`), etc.
- **Development:** TypeScript (`typescript`), Vite (`vite`), ESLint (`eslint`), Prettier (`prettier`)

_(Refer to `package.json` for specific versions and a complete list)_

## Data Structures

1. Users: Our platform users, the investors, they have a name email and they all belong to a specific workspace. Each user that belong to the same workspace, will share most of the data.
1. Workspaces: Our clinets firm profile. They have a name and a list of users.
1. Templates: Each workspace will have one template per industry. At the moment we will only analyse InsurTech.
1. Businesses: The subject of analysis of the users. They have a name, creation date and website.
1. Business profiles: The data about the businesses. The profile will contain the main data points. Each data point comes with the keys: value, prompt, proposeChange, editedAt, source, approvedBy.
1. Files: Most of the data will come from documents, decks, spreadhseets, calls transcript, crustadata...
1. Jobs: Any running analysis, is a job and this data keeps track of what is to be done, doing and done.
1. Logs: This tracks all the main interactions that the user is having with the platform.
1. \*Chats: Chat objects that we will maintain once we have the chat deployed.

## Setup and Installation

1.  **Prerequisites:**
    - Node.js (version >= 20.0.0)
    - npm
    - AWS Account and configured credentials (for SST, DynamoDB, S3, etc.)
2.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
3.  **Install dependencies:**

    ```bash
    npm install

    ```

4.  **Environment Variables:** Set up necessary environment variables. This typically involves creating a `.env` file based on a template (if one exists) or setting variables for AWS credentials using sst Secrets, API keys (Custdata, AI services), database names, etc.
5.  **Start the server:**
    ```bash
    npx sst dev
    ```
6.  **Run Infrastructure (if using SST):**
    ```bash
    npx sst deploy --stage <your-stage-name>
    ```

## User flow

1. Login
1. Click on the create company button
1. Modal opens up and ask for the company website, user types and confirms
1. Gemini checks the domain and provides a json with name, domain, and description
1. User confirms and a new company is created, the user is redirected to the company profile, a new company porfile is stored in the db, contianing only the initial data collected via gemini
1. The user can explore the profile sections - mostly empty - of Overview, Financial, Team, Market, Calls, Files, Benchmark, Chat.
1. The overview tab contains 4 cards - product, team, financial and investment.
   1. The user can click on a button in the product tab to populate the product via Gemini or by uploading documents.
   1. The user can click on a button in the team tab to populate the team via our Linkeding api (Crustdata)
   1. The user can click on a button in the financial tab to populate the financial by uploading documents (decks or xllsx).
   1. The user can click on a button in the investment tab to populate the investment via Gemini or by uploading documents.
   1. The user can click on a button in the investment tab to populate the investment via Crunchbase api (crustadata) or by uploading documents.
   1. The user can modify any of the fields in the overview tab and add fields within the sections.
   1. The user when adds a field, needs to also add the prompt for the AI to understand the kpi and retrieve the correct,data. The prompt can be saved in the workspace tempalte or only stay in the company profile. The autopopulation also can access data from web, crustadata or files, the user can choose.
1. The team tab contains an overview of the team as per the live version. A chronjob monthly updates the data via Crustdata.
1. Financial tab contains a table with 15 main KPIs that can be updated manually or by uploding financial data.
1. The market tab contains a field (and more that can be added) that describes the market the company is in. The data is inserted manually or populated from documents, gemini or calls transcripts.
1. Tha calls tab is a way to turn the transcripts into 9 bulletpoints: 3 main takeways, 3 highlights of the compnay or market, 3 downsides.
1. All the files uploaded are listed in the files tab. This tab also shows the categorization of each file (product investment, financial), it shows the 'processing stage' of the file.
1. The Benchmark tab allows the user to retrieve kpis of other companies apart from the one the profile belongs to. The user selects the companies, and types the KPI to compare. The dashboard retrieves the data and displays it in a table.
1. The chat functionality allows the user to further benchmark the company by asking questions. The chats histories can be saved and re-used. The user can choose if the AI needs to retrive from all the data, only this company's data, only crustada, web or documents or database.

## Tasks

1. Workspace template
   Each workspace comes with a company profile template per industry. At the moment we only have one industry - InsurTech.
   A new section accsssible via the main sidebar should allow the user to see the template, and should allow the user to modify it.
   The template represent all the initial fields we expect every company to have.
   Template comes with the following format:
   templateId: { type: "string" },
   templateIndustry: { type: "string" },
   template:{
   profileId: { type: "string" },
   createdAt: {type: "string",},
   updatedAt: {type: "string",},
   workspaceId: { type: "string" },
   businessId: { type: "string", required: false },
   domain: { type: "string" },
   businessUrlSlug: { type: "string", required: false },
   creator: {
   email: { type: "string" },
   userId: { type: "string" },
   },
   product*: { description, businessModel, productFeatures, productPricing, productDistribution, productMarket, productCompetitors },
   team*: {
   name, linkedinUrl, imgUrl, title, description
   }[],
   financial*: { 15 KPis },
   investment*: { investor, amount, date, stage }[],
   },

- The content of each key is a map with the following format:
  {
  prompt: { type: "string" },
  data: { type: "string" },
  source: { type: "string" },
  createdAt: { type: "string" },
  approvedBy: { type: "string" },
  }

2.  Overview page
    The overview page will look similar to the live version. However, we will use the new input box component, and we allow the user to add new fields. The new component allows the modification of the prompt and the data. It does not yet provide a way to confirm suggested modification made by AI. Every change to the profile should be saved in a new copy of the profile, so that we can easily revert back to previous changes. A panel on the right similarly to the history tab in google docs, should allow just that.
    In each section of the overview, as described in the User Flow, we should be able to manually trigger the AI to populate the section.

3.  Data ingestion.
    Each document gets saved as araw version, and a new document profile is created in the document table. The profile contains all the relevant fields and keeps track of the state of the anlysis. If the FE finds a document in process, can start a polling mechanism to check the status of the document. Each document gets categories. The output of the ingestion is a markdown file that will be used to populate the company profile section. 1. Overview page 2
    We need to make the data ingestion work so that we can populate the different section using documents. The data ingestion as per the python code in the task repo.

        1. Financial page
        We need to make the data ingestion work so that we can populate the different section using documents. The data ingestion as per the python code in the task repo.

4.  Chat benchmark.
    A chat functionality should allow the user to select the sources of data they want to use. The user can then prompt the LLM which will go fetch the data, analyse the data, make calculation, and provide a response. Ideally most of the questions are anwered after the LLM with a succesfull SQL query is returned with the data. In other cases the LLM may acess the web or the vector database where we store all the markdowns (these markdowns are optimised for LLM retrieval - ex. to avoid confusion between sentences about revenues that belong to different companies, each sentence always contains the company name).

5.  Benchmarking.
    The benchmarking page should allow the user to select the companies they want to compare the selected company to. The user can then select the KPI they want to compare. The dashboard should then display a table with the selected companies and the selected KPI.

## Common issues

1. Add the AWS credentials to the .env file for Auth to work
1. Add all the Secrets in the sst.config.ts as per sst secret documentation
