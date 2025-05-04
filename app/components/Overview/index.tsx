import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BusinessProfile } from "@/lib/typesCompany";
import { TextEditArea } from "../ui/textEditArea";
export default function Overview({ company }: { company: BusinessProfile }) {
  return (
    <div className="min-w-[1024px] w-max py-4 flex items-start justify-between">
      <div className="w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>Business overview</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <TextEditArea
              name="overview"
              actionName="updateOverview"
              className="w-full"
              defaultValue={"Ciao"}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Product</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <TextEditArea
              name="overview"
              actionName="updateOverview"
              className="w-full"
              defaultValue={"Ciao"}
              value={"Ciao"}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
