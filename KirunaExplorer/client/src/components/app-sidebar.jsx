import { Map, GanttChart, Telescope, FileText, LandPlot } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

// This is sample data.
const data = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Kiruna Explorer",
      logo: Telescope,
      plan: "",
    },
  ],
  navMain: [
    {
      title: "Map",
      url: "/map",
      icon: Map,
      isActive: true,
    },
    {
      title: "Areas",
      url: "/areas",
      icon: LandPlot,
    },
    {
      title: "Graph",
      url: "/graph",
      icon: GanttChart,
    },
    {
      title: "Documents",
      url: "/add-document-description",
      icon: FileText,
      isActive: true,
      items: [
        {
          title: "Add document description",
          url: "/add-document-description",
        },
        {
          title: "Show documents",
          url: "/documents/list",
        },
        {
          title: "Resources Management",
          url: "/addResources",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }) {
  const { user } = useAuth();

  // Keep all menu items for urban_planner, only show Map for others
  // const navItems =
  //   user?.role === "urban_planner"
  //     ? data.navMain // Show all items
  //     : data.navMain.filter((item) => item.title === "Map" | item.title === "Documents"); // Only show Map
  const navItems =
    user?.role === "urban_planner"
      ? data.navMain
      : data.navMain
          .map((item) => {
            if (item.title === "Documents") {
              return {
                ...item,
                items: item.items.filter(
                  (subItem) => subItem.title === "Show documents"
                ),
              };
            }
            return item;
          })
          .filter((item) => item.title === "Map" || item.title === "Documents");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
