import { useEffect, useState, ComponentPropsWithoutRef } from "react";
import { Form, useFetcher, useNavigate } from "@remix-run/react";

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
import { MiniUser, Workspace } from "@/lib/types_dep";
import { BusinessProfile, CallType } from "@/lib/typesCompany";

import { format } from "date-fns";

export type ComboBoxItemType = {
  value: string;
  label: string;
  newEntry: boolean;
};

const relationshipOptions = ["Expert", "Investor", "Client", "Other"];

function userToOption(u: MiniUser) {
  const fullName = u.name + " " + u.surname;
  return { label: fullName, value: u.PK };
}

export function CallDialog({
  company,
  workspace,
  businessId,
  miniUsers,
  call,
  onClose,
  setCall,
}: {
  company: BusinessProfile;
  workspace: Workspace;
  businessId: string;
  miniUsers: MiniUser[];
  call: CallType | undefined; // Optional, left blank for new calls
  onClose: Function;
  setCall: Function;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [companyParticipants, setCompanyParticipants] = useState<Option[]>([]);
  const [externalParticipant, setExternalParticipant] = useState("");
  const [externalParticipantCompany, setExternalParticipantCompany] =
    useState("");
  const [externalParticipantPosition, setExternalParticipantPosition] =
    useState("");
  const [
    externalParticipantRelationships,
    setExternalParticipantRelationships,
  ] = useState<Option[]>([]);
  const [transcript, setTranscript] = useState(call?.transcript || "");
  const [submitting, setSubmitting] = useState(false);
  const fetcher = useFetcher();
  const companyParticipantsOptions: Option[] = miniUsers.map(userToOption);
  const externalParticipantRelationshipOptions = relationshipOptions.map(
    (i) => {
      return { label: i, value: i };
    },
  );

  function handleOnOpenChange(v: boolean) {
    setOpen(v);
    if (v === false && onClose) {
      onClose();
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setSubmitting(true);

    fetcher.submit(e.currentTarget.form, { method: "POST" });

    // TODO confirm that submission was successful?

    setOpen(false);
    setSubmitting(false);
    if (onClose) onClose();
  };

  const handleDeleteCall = async (callId: string) => {
    // TODO have a loading state while call is deleting?
    fetcher.submit(`/api/call/${callId}`, { method: "POST" });
    setOpen(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    // console.log('fetcher state', fetcher.state, fetcher.data, fetcher.formData)
    if (!open && call) {
      setOpen(true);
      setDate(call.date);
      setCompanyParticipants(
        companyParticipantsOptions.filter((i) =>
          call.companyParticipants.includes(i.value),
        ),
      );
      setExternalParticipant(call.externalParticipant);
      setExternalParticipantCompany(call.externalParticipantCompany);
      setExternalParticipantPosition(call.externalParticipantPosition);
      setExternalParticipantRelationships(
        externalParticipantRelationshipOptions.filter((i) =>
          call.externalParticipantRelationship.includes(i.value),
        ),
      );
      setTranscript(call.transcript);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setCompanyParticipants([]);
      setExternalParticipant("");
      setExternalParticipantCompany("");
      setExternalParticipantPosition("");
      setExternalParticipantRelationships([]);
      setTranscript("");
    }
  }, [fetcher.state, call]);

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger
        asChild
        onClick={(e) => {
          e.preventDefault();
          setCall(null);
          handleOnOpenChange(true);
        }}
      >
        <Button className="col-span-2">
          <Plus />
          Add Call
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[925px] bg-gray-100 h-[auto] flex flex-col">
        <DialogHeader className="">
          <DialogTitle>
            {call ? "Edit Call Details" : "Log New Call"}
          </DialogTitle>
        </DialogHeader>
        <fetcher.Form
          method="post"
          action={call ? `/api/call/${call.callId}` : "/api/call"}
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col flex-grow gap-4 mt-4 "
        >
          <input type="hidden" name="businessId" value={businessId}></input>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <input value={date} name="date" type="hidden"></input>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(Date.parse(date))}
                      onSelect={(v) => {
                        if (v) {
                          // Handle GMT/timezones, we only care about date
                          const offset = v.getTimezoneOffset();
                          const newDate = new Date(
                            v.getTime() - offset * 60 * 1000,
                          );
                          setDate(newDate.toISOString().split("T")[0]);
                        } else {
                          setDate("");
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-row gap-2">
                <select
                  multiple={true}
                  name="companyParticipants"
                  className="hidden"
                >
                  {companyParticipants.map((v) => (
                    <option
                      key={v.value}
                      value={v.value}
                      selected={true}
                    ></option>
                  ))}
                </select>
                <MultipleSelector
                  className="bg-white"
                  defaultOptions={companyParticipantsOptions}
                  placeholder={`Participants from ${workspace.company}...`}
                  emptyIndicator=""
                  value={companyParticipants}
                  onChange={setCompanyParticipants}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Name of the person you've talked to..."
                  className="bg-white"
                  name="externalParticipant"
                  required={true}
                  value={externalParticipant}
                  onChange={(e) => {
                    setExternalParticipant(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Company..."
                  className="bg-white"
                  name="externalParticipantCompany"
                  required={true}
                  value={externalParticipantCompany}
                  onChange={(e) => {
                    setExternalParticipantCompany(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-row gap-2">
                <Input
                  placeholder="Position..."
                  className="bg-white"
                  name="externalParticipantPosition"
                  required={true}
                  value={externalParticipantPosition}
                  onChange={(e) => {
                    setExternalParticipantPosition(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-row gap-2">
                <select
                  multiple={true}
                  name="externalParticipantRelationship"
                  className="hidden"
                >
                  {externalParticipantRelationships.map((v) => (
                    <option
                      key={v.value}
                      value={v.value}
                      selected={true}
                    ></option>
                  ))}
                </select>
                <MultipleSelector
                  className="bg-white"
                  defaultOptions={externalParticipantRelationshipOptions}
                  placeholder={`Relationship to ${company?.companyProfile?.basicInfo.companyName}...`}
                  emptyIndicator=""
                  value={externalParticipantRelationships}
                  onChange={setExternalParticipantRelationships}
                />
              </div>
            </div>
            <Textarea
              className="border border-gray-300 bg-white min-h-[200px] max-h-[400px] min-w-[400px]"
              placeholder="Paste your notes or call transcript here..."
              name="transcript"
              isEditable={true}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
              }}
            />
          </div>
          {/* <Card>
                <CardContent className="space-y-4">
                  <div>
                    <ul className="list-disc list-inside text-xs text-gray-600 pt-4">
                      {company.calls.overallSummary.map(
                        (s: string, index: number) => <li key={index}>{s}</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Highlights</h3>
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {company.calls.overallHighlights.map(
                        (s: string, index: number) => <li key={index}>{s}</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Challenges</h3>
                    <ul className="list-disc list-inside text-xs text-gray-600">
                      {company.calls.overallChallenges.map(
                        (s: string, index: number) => <li key={index}>{s}</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card> */}
          <div className="flex flex-row gap-2">
            {call ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex flex-grow">
                    Remove call
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the call and asssociated
                      notes.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction>
                      <fetcher.Form
                        method="POST"
                        action={`/api/call/${call.callId}`}
                      >
                        <Button type="submit" name="action" value="deleteCall">
                          Delete
                        </Button>
                      </fetcher.Form>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              ""
            )}
            <Button
              className="flex flex-grow"
              type="submit"
              // onClick={handleSubmit}
              name="action"
              value={call ? "updateCall" : "createCall"}
              disabled={
                !(
                  date.length > 0 &&
                  companyParticipants.length > 0 &&
                  externalParticipant.length > 0 &&
                  externalParticipantCompany.length > 0 &&
                  externalParticipantPosition.length > 0 &&
                  externalParticipantRelationships.length > 0
                )
              }
            >
              {submitting ? "Saving..." : "Save and analyse"}
            </Button>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
