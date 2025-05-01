import * as React from "react";
import {
  // ArrowRightLeft,
  // BookOpen,
  Building,
  // Command,
  Home,
  // Key,
  LifeBuoy,
  Send,
  // Settings2,
  File,
} from "lucide-react";

import { NavMain } from "@/components/Sidebar/NavMain";
import { NavProjects } from "@/components/Sidebar/NavProjects";
import { NavSecondary } from "@/components/Sidebar/NavSecondary";
import { NavUser } from "@/components/Sidebar/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { User } from "@/lib/types";
import { useMemo } from "react";
import { Link } from "@remix-run/react";

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      // items: [
      //   {
      //     title: "Documents",
      //     url: "#documents",
      //   },
      //   {
      //     title: "Emails",
      //     url: "#emails",
      //   },
      //   {
      //     title: "Notes",
      //     url: "#notes",
      //   },
      // ],
    },
    {
      title: "Company records",
      url: "/dashboard/businesses",
      icon: Building,
      // items: [
      //   {
      //     title: "New opportunities",
      //     url: "#",
      //   },
      //   {
      //     title: "Under due diligence",
      //     url: "#",
      //   },
      //   {
      //     title: "Portfolio",
      //     url: "#",
      //   },
      //   {
      //     title: "All companies",
      //     url: "#",
      //   },
      // ],
    },
    // {
    //   title: "Onepagers",
    //   url: "/dashboard/onepagers",
    //   icon: File,
    //   // items: [
    //   //   {
    //   //     title: "Introduction",
    //   //     url: "#",
    //   //   },
    //   //   {
    //   //     title: "Get Started",
    //   //     url: "#",
    //   //   },
    //   //   {
    //   //     title: "Tutorials",
    //   //     url: "#",
    //   //   },
    //   //   {
    //   //     title: "Changelog",
    //   //     url: "#",
    //   //   },
    //   // ],
    // },
    // {
    //   title: "Transactions",
    //   url: "/transactions",
    //   icon: ArrowRightLeft,
    //   items: [
    //     {
    //       title: "Transactions",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Credentials",
    //   url: "/credentials",
    //   icon: Key,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  // navSecondary: [
  //   {
  //     title: "Support",
  //     url: "/dashboard/support",
  //     icon: LifeBuoy,
  //   },
  //   {
  //     title: "Feedback",
  //     url: "/dashboard/feedback",
  //     icon: Send,
  //   },
  // ],
  projects: [
    //   {
    //     name: "Design Engineering",
    //     url: "/projects/design-engineering",
    //     icon: Frame,
    //   },
    //   {
    //     name: "Sales & Marketing",
    //     url: "/projects/sales-marketing",
    //     icon: PieChart,
    //   },
    //   {
    //     name: "Travel",
    //     url: "/projects/travel",
    //     icon: Map,
    //   },
  ],
};
type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User | null;
};
export default function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar
      variant="sidebar"
      collapsible="none"
      className="h-screen"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {/* <Command className="size-4" /> */}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.companyName}
                  </span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {data.projects.length > 0 && <NavProjects projects={data.projects} />}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      {/* <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter> */}
    </Sidebar>
  );
}
