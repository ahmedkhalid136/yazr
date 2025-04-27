import { SearchIcon } from "lucide-react";
// import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export default function Search({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <div className="relative w-full">
        <SearchIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search"
          className="w-full pl-8 border-[1.5px] border-gray-200 rounded-lg"
        />
      </div>
      {/* <Button variant="outline" className="px-6 py-6 text-gray-500">
        Search
      </Button> */}
    </div>
  );
}
