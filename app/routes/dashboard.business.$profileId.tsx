import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CallCard } from "@/components/CallCard";
import { CallDialog } from "@/components/CallDialog";
import { ChevronLeft } from "lucide-react";
import {
  Link,
  redirect,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import db from "@/lib/db.server";
import { auth } from "@/server/auth/auth";
import { useState } from "react";

import { BusinessData, BusinessProfile, CallType } from "../lib/typesCompany";
import {
  MiniUserSchema,
  MiniUser,
  User,
  Workspace,
  FileType,
  CrustDataItem,
} from "../lib/types";

import { BusinessOnePager } from "@/components/Business/BusinessOnePagerTab";
import { BusinessKeyPeople } from "@/components/Business/BusinessKeyPeopleTab";
import UploadDocumentsAlert from "@/components/UploadDocumentsAlert";
import { FileTab } from "@/components/Business/FileTab";
import {
  Accordion,
  AccordionTrigger,
  AccordionItem,
  AccordionContent,
} from "@/components/ui/accordion";
import crustdata from "@/lib/crustdata.server";
import TabCalls from "@/components/TabCalls";

export default function CompanyPage() {
  const {
    company,
    workspace,
    profileId,
    calls,
    files,
    miniUsers,
    workspaceId,
    userId,
    dev,
    crustdata,
  } = useLoaderData<{
    company: BusinessProfile;
    workspace: Workspace;
    profileId: string;
    calls: CallType[];
    files: FileType[];
    miniUsers: MiniUser[];
    workspaceId: string;
    userId: string;
    dev: boolean;
    crustdata: CrustDataItem[];
  }>();
  const [searchParams] = useSearchParams();

  console.log("query parameters", searchParams.get("tab"));
  const tabParam = searchParams.get("tab") === "upload" ? "files" : "overview";

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/businesses" className="hover:opacity-80">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-gray-600 flex items-center justify-center">
              {/* <img
                src={
                  company.basicInfo.urls.website
                    ? `${company.basicInfo.urls.website}/favicon.ico`
                    : ""
                }
                alt={company.basicInfo.companyName}
                className="h-8 w-8"
              /> */}
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {company.companyProfile?.basicInfo.companyName}
              </h1>
              <a
                href={company.domain}
                className="text-sm text-gray-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {company.domain}
              </a>
            </div>
          </div>
        </div>
        {/* <div className="relative w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search" className="pl-8" />
        </div> */}
      </div>

      <Tabs defaultValue={tabParam} className="w-full">
        {/* Navigation Tabs */}
        <TabsList className="w-full justify-start gap-2 h-auto bg-transparent  border-b-[1.5px] border-gray-200">
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Overview
          </TabsTrigger>
          {/* <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Financials
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Benchmarking
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Ownership
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Data Sources
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Meetings
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Deals
          </TabsTrigger>*/}
          <TabsTrigger
            value="keypeople"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Key people
          </TabsTrigger>
          {/* <TabsTrigger
            value="overview"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            AI Chat
          </TabsTrigger> */}
          <TabsTrigger
            value="calls"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Calls
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="mb-[-5px] data-[state=active]:border-b-[1.5px] data-[state=active]:border-gray-500 rounded-none"
          >
            Files
          </TabsTrigger>
        </TabsList>
        {/* Tabs */}

        <TabsContent value="overview" className="mt-6">
          {!company.hasPrivateProfile && <UploadDocumentsAlert />}
          <BusinessOnePager
            company={company.companyProfile as BusinessData}
            webProfile={company.webProfile as BusinessData}
            privateProfile={company.privateProfile as BusinessData}
            profileId={company.profileId}
            editor={company.creator.email}
          />
        </TabsContent>

        <TabsContent value="keypeople" className="mt-6">
          <BusinessKeyPeople company={company} crustdata={crustdata} />
        </TabsContent>

        <TabsContent value="calls" className="mt-6">
          <TabCalls
            company={company}
            workspace={workspace}
            profileId={company.profileId}
            miniUsers={miniUsers}
            calls={calls}
          />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FileTab
            files={files}
            workspaceId={workspaceId}
            userId={userId}
            businessId={company.profileId}
          />
        </TabsContent>
      </Tabs>
      {dev && (
        <Accordion type="single" collapsible>
          <AccordionItem value="devData">
            <AccordionTrigger>DEV DATA</AccordionTrigger>
            <AccordionContent>
              <pre className="text-xs max-w-[800px]">
                <h1>===== Company merged data =====</h1>
                {JSON.stringify(company.companyProfile, null, 2)}
              </pre>
              <pre className="text-xs max-w-[800px]">
                <h1>====== Private data ======</h1>
                {JSON.stringify(company.privateProfile, null, 2)}
              </pre>
              <pre className="text-xs max-w-[800px]">
                <h1>====== Web data ====== </h1>
                {JSON.stringify(company.webProfile, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const authObj = await auth(request);
  if (!authObj) {
    console.log("redirecting to login");
    return redirect("/login");
  }
  const dev = [
    "alfredo@yazr.ai",
    "laura@yazr.ai",
    "a.belfiori@gmail.com",
  ].includes(authObj.subject.properties.email);
  console.log("dev", authObj.subject.properties.email);

  const workspaceId = authObj.workspaceId;
  const userId = authObj.userId;
  const profileId = params.profileId;
  if (!profileId || !workspaceId) {
    return redirect("/dashboard");
  }

  const workspace = await db.workspace.get(workspaceId);
  const company = await db.businesses.get(profileId);
  if (!company) {
    return redirect("/dashboard");
  }
  const calls = await db.call.getFromBusinessId(profileId);
  const files = await db.file.queryFromBusinessId(profileId);
  const crust = await crustdata.byDomainSafe(company?.domain);
  // Get miniUsers (names of other users from the same workspace)
  const rawUsers = await db.user.getAll(workspaceId || "");
  const miniUserKeys = Object.keys(MiniUserSchema.shape) as (keyof MiniUser)[];
  const miniUsers = rawUsers.map(
    (user: User) =>
      Object.fromEntries(
        miniUserKeys.map((key) => [key, user[key]]),
      ) as MiniUser,
  );

  return Response.json({
    company: company as BusinessProfile,
    workspace,
    profileId,
    calls,
    files,
    workspaceId,
    userId,
    miniUsers,
    dev,
    crustdata: crust,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("action");
  const formData = await request.formData();
  const jobId = formData.get("jobId");
  const action = formData.get("button");
  console.log(formData.entries());
  if (action === "refreshPager") {
    await onePagerRerun(jobId as string);
  }
  return redirect(`/dashboard/business/${jobId}`);
}

const onePagerRerun = async (jobId: string) => {
  console.log("We need to rewrite this function", jobId);
};
