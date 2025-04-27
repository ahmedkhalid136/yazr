import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "@remix-run/react";
import { Sparkle } from "lucide-react";

export default function UploadDocumentsAlert() {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex justify-start items-center gap-4 pb-2">
          <h1>
            Upload the company documents: enhance this profile with your private
            data
          </h1>
          <Link to="?tab=upload" reloadDocument>
            <Button className=" flex gap-2 ">
              <Sparkle className="w-4 h-4" /> Upload
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
