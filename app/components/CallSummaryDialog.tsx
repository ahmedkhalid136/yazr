import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";

import { Plus, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MultipleSelector, { Option } from "@/components/ui/multiple-selector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { cn } from "@/lib/utils";
import { MiniUser, Workspace } from "@/lib/types";
import { BusinessProfile, CallType } from "@/lib/typesCompany";

import { format } from "date-fns";

export type ComboBoxItemType = {
  value: string;
  label: string;
  newEntry: boolean;
};

const relationshipOptions = ["Expert", "Investor", "Client", "Other"];

export function CallSummaryDialog({
  company,
  workspace,
  businessId,
  calls,
}: {
  company: BusinessProfile;
  workspace: Workspace;
  businessId: string;
  calls: CallType[];
}) {
  const [open, setOpen] = useState(false);
  const fetcher = useFetcher();
  const [callsForSummary, setCallsForSummary] = useState<Option[]>([]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // e.preventDefault();
    console.log("callsForSummary", callsForSummary);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="col-span-2">
          <Plus />
          Create summary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[925px] bg-gray-100 h-[auto] flex flex-col">
        <DialogHeader className="">
          <DialogTitle>Select the calls to include in the summary</DialogTitle>
        </DialogHeader>
        <fetcher.Form
          method="post"
          action={`/api/call/`}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col flex-grow gap-4 mt-4 "
        >
          <input type="hidden" name="businessId" value={businessId}></input>
          <input
            type="hidden"
            name="profileId"
            value={company.profileId}
          ></input>
          <div className="grid grid-cols-1 gap-4 my-4">
            <MultipleSelector
              className="bg-white"
              placeholder={`Select the calls transcript for the summary`}
              emptyIndicator="No calls found"
              options={calls.map((call) => ({
                value: call.callId,
                label: `${call.date} - ${call.externalParticipant}`,
              }))}
              value={callsForSummary}
              onChange={setCallsForSummary}
            />
            <input
              type="hidden"
              name="calls"
              value={JSON.stringify(callsForSummary)}
            ></input>
            <Button type="submit" name="action" value="createSummary">
              Create summary
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
