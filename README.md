# Project Name (Replace with actual name if known)

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

4.  **Environment Variables:** Set up necessary environment variables. This typically involves creating a `.env` file based on a template (if one exists) or setting variables for AWS credentials, API keys (Custdata, AI services), database names, etc. _(Specific variables need documentation)_.
5.  **Start the server:**
    ```bash
    npx sst dev
    ```
6.  **Run Infrastructure (if using SST):**
    ```bash
    npx sst deploy --stage <your-stage-name>
    ```
