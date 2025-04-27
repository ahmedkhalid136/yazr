import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState } from "react";

import { Loader2 } from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { BusinessProfile } from "@/lib/typesCompany";
import { AutoComplete } from "./Autocomplete";

const isValidDomain = (domain: string) => {
  // Check if the domain is empty
  console.log("Domain checked:", domain);
  if (!domain || domain.trim() === "") {
    return false;
  }

  // Extract domain from URL if it's a full URL
  let cleanDomain = domain;
  try {
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      const url = new URL(domain);
      cleanDomain = url.hostname;
    }
  } catch (e) {
    // If URL parsing fails, continue with original input
  }

  // Check for valid website domain format
  // Must have at least one dot to separate domain and TLD
  // Allow alphanumeric characters, hyphens (not at start/end of segments)
  const regex = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z0-9-]{2,63}$/;

  // Ensure it has at least one dot
  if (!cleanDomain.includes(".")) {
    return false;
  }

  return regex.test(cleanDomain);
};

export default function ModalDomain({
  companies,
}: {
  companies: BusinessProfile[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loadingConfirm, setLoadingConfirm] = useState<boolean>(false);
  const companyWebsites = companies.map((company) => ({
    value: company.domain,
    label: company.domain,
  }));
  const companyWebsitesDomains = companies.map((company) => company.domain);
  const navigate = useNavigate();
  const handleFetchDomain = (domain: string) => {
    if (isValidDomain(domain)) {
      setError("");
      setIsLoading(true);
      if (companyWebsitesDomains.includes(domain)) {
        navigate(
          "/dashboard/business/" +
            companies.find((company) => company.domain === domain)?.profileId,
        );
        setIsLoading(false);
        return;
      }
      const sanitisedDomain = domain
        .replace("https://", "")
        .replace("http://", "");
      fetch("/api/web/getCompanyWebsiteFromGemini?domain=" + sanitisedDomain)
        .then((res) => res.json())
        .then((res) => {
          setDescription(res.content);
          setDomain(domain);
          setIsLoading(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setError("Invalid domain");
    }
  };

  const handleCreateCompany = async (domain: string, description: string) => {
    console.log("create company");
    setLoadingConfirm(true);
    const result = await fetch("/api/web/createCompany", {
      method: "POST",
      body: JSON.stringify({ domain, description }),
    });

    const data = await result.json();
    console.log(data);
    const profileId = data.profileId;
    if (!profileId) {
      setError("Failed to create company");
      setLoadingConfirm(false);
      return;
    }
    setLoadingConfirm(false);
    navigate("/dashboard/business/" + profileId);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add company</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Find company</DialogTitle>
          <DialogDescription>
            {error ? (
              <p className="text-red-500">
                {error}
                {""}
              </p>
            ) : (
              <p className="text-gray-500">Type the company website url.</p>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 justify-between items-center pb-8">
          {/* <Input  
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          /> */}
          <AutoComplete
            onSubmit={(domain) => {
              setDomain(domain);
              if (isValidDomain(domain)) {
                setError("");
                handleFetchDomain(domain);
              } else {
                setError("Invalid domain");
              }
            }}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            items={companyWebsites ?? []}
            isLoading={isLoading}
            emptyMessage={`Type a domain like "stripe.com"`}
          />
          {/* {JSON.stringify(companyWebsites)} */}
          <Button
            variant={description !== "" ? "outline" : "default"}
            onClick={() => {
              console.log("searchValasdaue", searchValue);
              const filteredItems = companyWebsites.filter((item) =>
                searchValue.toLowerCase().includes(item.value.toLowerCase()),
              );
              if (filteredItems.length === 1) {
                navigate(
                  "/dashboard/business/" +
                    companies.find(
                      (company) => company.domain === filteredItems[0].value,
                    )?.profileId,
                );
              } else {
                console.log("searchVaaaalue", searchValue);
                handleFetchDomain(searchValue);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch"}
          </Button>
        </div>
        {/* {JSON.stringify(companyWebsites)}
        {searchValue} */}
        {description && <p className="text-gray-500">{description}</p>}

        <DialogFooter>
          {/* <DialogClose asChild> */}
          {description && (
            <Button
              onClick={() => handleCreateCompany(domain, description)}
              disabled={loadingConfirm}
              className="flex items-center gap-2"
            >
              {loadingConfirm ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          )}
          {/* </DialogClose> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
