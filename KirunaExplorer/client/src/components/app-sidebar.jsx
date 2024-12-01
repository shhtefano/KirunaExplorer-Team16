import {
  Map,
  Settings2,
  GanttChart,
  Telescope,
  FileText,
  ChevronDown,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";

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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
