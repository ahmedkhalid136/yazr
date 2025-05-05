import { FileType } from "@/lib/types_dep";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BusinessFilesUploader } from "./BusinessFilesUploader";
import { BusinessFilesViewer } from "./BusinessFilesViewer";

export function FileTab({
  files,
  workspaceId,
  userId,
  businessId,
}: {
  files: FileType[];
  workspaceId: string;
  userId: string;
  businessId: string;
}) {
  return (
    <div className="grid grid-cols-9 gap-6 w-full">
      <Card className="col-span-4 min-w-[500px]">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Files ({files.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <BusinessFilesViewer files={files} />
        </CardContent>
      </Card>
      <div className="col-span-5">
        <BusinessFilesUploader
          workspaceId={workspaceId}
          userId={userId}
          businessId={businessId}
        />
      </div>
    </div>
  );
}
