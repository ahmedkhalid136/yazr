import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CallType } from "../lib/typesCompany";

export function CallCard({
  call,
  onClick,
}: {
  call: CallType;
  onClick: Function | undefined;
}) {
  return (
    <Card
      onClick={(e) => {
        onClick ? onClick() : null;
      }}
      className="cursor-pointer"
    >
      <CardHeader className="pt-2 pb-2 flex flex-row items-baseline gap-2">
        <Badge variant="outline">{call.date}</Badge>
        <Badge variant="outline">{call.externalParticipantCompany}</Badge>
        <Badge variant="outline">{call.externalParticipant}</Badge>
        <Badge variant="outline">
          {call.externalParticipantRelationship.length > 1
            ? call.externalParticipantRelationship.join(", ")
            : call.externalParticipantRelationship}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <hr></hr>
        <ul className="list-disc list-inside text-sm text-gray-600 mt-3">
          <span className="font-semibold">Main Takeaways:</span>
          {call.summary && call.summary.map((s: string) => <li>{s}</li>)}
          <span className="font-semibold">Highlights:</span>
          {call.highlights && call.highlights.map((s: string) => <li>{s}</li>)}
          <span className="font-semibold">Challenges:</span>
          {call.challenges && call.challenges.map((s: string) => <li>{s}</li>)}
        </ul>
      </CardContent>
    </Card>
  );
}
