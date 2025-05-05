import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TextEditArea } from "../ui/textEditArea";
import { CreateProfilePayload } from "@/lib/types";
export default function Overview({
  profile,
}: {
  profile: CreateProfilePayload;
}) {
  const description = profile.fields.find(
    (field) => field.title === "description",
  )?.value;
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
              defaultValue={description}
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
