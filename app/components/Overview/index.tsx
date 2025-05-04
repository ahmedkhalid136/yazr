import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BusinessProfile } from "@/lib/typesCompany";
import { TextEditArea } from "../ui/textEditArea";
export default function Overview({ company }: { company: BusinessProfile }) {
  return (
    <div className="min-w-[1024px] w-max py-4 flex items-start justify-between">
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle>Business overview</CardTitle>
        </CardHeader>
        <CardContent>
          <TextEditArea name="overview" actionName="updateOverview" />
        </CardContent>
      </Card>
    </div>
  );
}
