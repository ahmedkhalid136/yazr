import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessFilesUploader } from "@/components/Business/BusinessFilesUploader";
import { useState } from "react";

import { FileType } from "../lib/types";
import { BusinessFilesViewer } from "@/components/Business/BusinessFilesViewer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ModalDomain from "@/components/ModalDomain";

export default function CompanyPage() {
  const [companyName, setCompanyName] = useState("");
  const [phase, setPhase] = useState<"name" | "files" | "processing" | "check">(
    "name",
  );
  const [companyDescription, setCompanyDescription] = useState("");
  const [files, setFiles] = useState<FileType[]>([]);
  const [error, setError] = useState("");
  const handleDomain = (domain: string) => {
    setCompanyName(domain);
  };
  return (
    <div className="p-12">
      <div className=" flex justify-start items-center">
        <Input
          placeholder="Type company website..."
          className="w-full border-none md:text-xl font-bold h-[68px] outline-none focus:ring-0 focus-visible:ring-0"
          value={companyName}
          onChange={(e) => handleDomain(e.target.value)}
        />
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {phase === "files" && (
        <>
          <BusinessFilesUploader></BusinessFilesUploader>
        </>
      )}
      {phase === "processing" && (
        <BusinessFilesViewer files={files}></BusinessFilesViewer>
      )}
    </div>
  );
}
