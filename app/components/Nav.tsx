import {
  Briefcase,
  CreditCard,
  Database,
  Home,
  Search,
  Settings,
  Star,
} from "lucide-react";
import { Button } from "./ui/button";
import { Link, useLocation } from "@remix-run/react";
import { cn } from "@/lib/utils";
export default function Nax() {
  const pathname = useLocation();

  return (
    <div className="h-full w-fit p-6">
      <div className="bg-gray-100 rounded-lg py-6 px-4 h-full w-[240px] border-[1.5px] border-gray-200">
        <div className="flex flex-col justify-start gap-2 text-left">
          <Link to="/">
            <Button
              className="w-full flex justify-start items-center p-6"
              variant="ghost"
            >
              <Star className="w-4 h-4 text-gray-900" />
              <p className="w-full text-left text-gray-900 font-bold">YazrAI</p>
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button
              className={cn(
                "w-full hover:bg-gray-200 p-6 flex justify-start items-center font-normal text-gray-500",
                pathname.pathname === "/dashboard" &&
                  "bg-gray-200 text-gray-900 font-semibold"
              )}
              variant="ghost"
            >
              <Home className="w-4 h-4" />
              <p className="text-left w-full">Home</p>
            </Button>
          </Link>
          <Link to="/companies">
            <Button
              className={cn(
                "w-full hover:bg-gray-200 p-6 flex justify-start items-center font-normal text-gray-500",
                pathname.pathname === "/companies" &&
                  "bg-gray-200 text-gray-900 font-semibold"
              )}
              variant="ghost"
            >
              <Briefcase className="w-4 h-4" />
              <p className="text-left w-full">Companies</p>
            </Button>
          </Link>
          <Link to="/data">
            <Button
              className={cn(
                "w-full hover:bg-gray-200 p-6 flex justify-start items-center font-normal text-gray-500",
                pathname.pathname === "/data" &&
                  "bg-gray-200 text-gray-900 font-semibold"
              )}
              variant="ghost"
            >
              <Database className="w-4 h-4" />
              <p className="text-left w-full">Data</p>
            </Button>
          </Link>
          <Link to="/transactions">
            <Button
              className={cn(
                "w-full hover:bg-gray-200 p-6 flex justify-start items-center font-normal text-gray-500",
                pathname.pathname === "/transactions" &&
                  "bg-gray-200 text-gray-900 font-semibold"
              )}
              variant="ghost"
            >
              <CreditCard className="w-4 h-4" />
              <p className="text-left w-full">Transactions</p>
            </Button>
          </Link>
          <Link to="/search">
            <Button
              className={cn(
                "w-full hover:bg-gray-200 p-6 flex justify-start items-center font-normal text-gray-500",
                pathname.pathname === "/search" &&
                  "bg-gray-200 text-gray-900 font-semibold"
              )}
              variant="ghost"
            >
              <Search className="w-4 h-4" />
              <p className="text-left w-full">Search</p>
            </Button>
          </Link>
          <Link to="/settings">
            <Button
              className={cn(
                "w-full hover:bg-gray-200 p-6 flex justify-start items-center font-normal text-gray-500",
                pathname.pathname === "/settings" &&
                  "bg-gray-200 text-gray-900 font-semibold"
              )}
              variant="ghost"
            >
              <Settings className="w-4 h-4" />
              <p className="text-left w-full">Settings</p>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
