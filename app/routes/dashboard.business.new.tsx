import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import { Link, Outlet } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";

import Overview from "@/components/Overview";

import { auth } from "@/.server/auth/auth";

import { TextEdit } from "@/components/ui/textEdit";

export default function CompanyPage() {
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
              <TextEdit
                defaultValue=""
                className="text-4xl font-semibold"
                actionName="updateCompanyName"
                name="companyName"
                placeholder="Company name"
                isHideAI={true}
                required={true}
              />
              <TextEdit
                defaultValue=""
                className="text-sm text-gray-500  hover:underline"
                actionName="updateCompanyName"
                name="companyName"
                placeholder="Website"
                isHideAI={true}
                required={true}
              />
            </div>
          </div>
        </div>
        {/* <div className="relative w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search" className="pl-8" />
        </div> */}
      </div>

      <Tabs defaultValue="overview" className="w-full">
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
        <Overview />
        {/* <TabsContent value="overview" className="mt-6">
          {!company.hasPrivateProfile && <UploadDocumentsAlert />}
          <BusinessOnePager
            company={company.companyProfile as BusinessData}
            webProfile={company.webProfile as BusinessData}
            privateProfile={company.privateProfile as BusinessData}
            profileId={company.profileId}
            editor={company.creator.email}
          />
        </TabsContent> */}

        {/* <TabsContent value="keypeople" className="mt-6">
          {crustdata?.web_traffic ? (
            <BusinessKeyPeople
              company={company}
              crustdata={{
                ...crustdata,
                website_traffic: crustdata.web_traffic || {},
              }}
            />
          ) : (
            <p>CrustData information not available.</p>
          )}
        </TabsContent> */}

        {/* <TabsContent value="calls" className="mt-6">
          <TabCalls
            company={company}
            workspace={workspace}
            profileId={company.profileId}
            miniUsers={miniUsers}
            calls={calls}
          />
        </TabsContent> */}

        {/* <TabsContent value="files" className="mt-6">
          <FileTab
            files={files}
            workspaceId={workspaceId}
            userId={userId}
            businessId={company.profileId}
          />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const authorised = await auth(request);
  if (!authorised) {
    return redirect("/login");
  }
  return Response.json({});
}

export async function action({ request }: ActionFunctionArgs) {
  console.log("action");
  const formData = await request.formData();
  const jobId = formData.get("jobId");
  const action = formData.get("action");
  const formObject = Object.fromEntries(formData.entries());
  console.log(formObject);
  // return redirect(`/dashboard/business/${jobId}`);
  return "Well done";
}
