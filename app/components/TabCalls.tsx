import { BusinessData, BusinessProfile, CallType } from "@/lib/typesCompany";

import { CallCard } from "./CallCard";
import { CallDialog } from "./CallDialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

import { MiniUser } from "@/lib/types";
import { Workspace } from "@/lib/types";
import { Input } from "./ui/input";

import { CallSummaryDialog } from "./CallSummaryDialog";
import { useState } from "react";

// For search functionality in company call cards on "Calls" tab
function findInValues(
  arr: CallType[], // List of objects to search
  value: string | number, // Value to search for
): CallType[] {
  value = String(value).toLowerCase();
  return arr.filter((o) =>
    Object.entries(o).some((entry) =>
      String(entry[1]).toLowerCase().includes(value),
    ),
  );
}

type TabCallsProps = {
  company: BusinessProfile;
  workspace: Workspace;
  profileId: string;
  miniUsers: MiniUser[];
  calls: CallType[];
};
export default function TabCalls({
  company,
  workspace,
  profileId,
  miniUsers,
  calls,
}: TabCallsProps) {
  const [filterCallsSearchQuery, setFilterCallsSearchQuery] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallType | null>(null);

  return (
    <div className="flex flex-row gap-6 w-full min-w-[1024px]">
      {/* General Summary */}
      <Card className="w-1/2 h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="flex justify-between">
            <p className="text-lg">General Summary</p>
            <CallSummaryDialog
              company={company}
              workspace={workspace}
              businessId={profileId}
              calls={calls}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <hr></hr>
          <div>
            <h3 className="font-semibold mb-2">Main Takeaways</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {company?.calls &&
                company?.calls?.overallSummary.map(
                  (s: string, index: number) => <li key={index}>{s}</li>,
                )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Highlights</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {company?.calls &&
                company?.calls?.overallHighlights.map(
                  (s: string, index: number) => <li key={index}>{s}</li>,
                )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Challenges</h3>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {company?.calls &&
                company?.calls?.overallChallenges.map(
                  (s: string, index: number) => <li key={index}>{s}</li>,
                )}
            </ul>
          </div>
        </CardContent>
      </Card>
      {/* Add new Calls notes */}
      <div className="flex flex-col gap-2 w-1/2">
        <div className="grid grid-cols-5 gap-2">
          <Input
            className="col-span-3"
            placeholder="Search calls..."
            onChange={(e) => setFilterCallsSearchQuery(e.target.value)}
          />
          <CallDialog
            company={company}
            workspace={workspace}
            businessId={profileId}
            miniUsers={miniUsers}
            call={selectedCall || undefined}
            onClose={() => setSelectedCall(null)}
            setCall={setSelectedCall}
          />
        </div>
        {(filterCallsSearchQuery.length > 0
          ? findInValues(calls, filterCallsSearchQuery)
          : calls
        ).map((call: CallType, index: number) => (
          <CallCard
            call={call}
            key={index}
            onClick={() => setSelectedCall(call)}
          ></CallCard>
        ))}
      </div>
    </div>
  );
}
