"use client"

import * as React from "react"
import {
  BellDotIcon,
  Briefcase,
  BookOpen,
  Bot,
  Command,
  Frame,
  NotebookPen,
  Map,
  PieChart,
  Settings2,
  HomeIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Viswajeet",
    email: "viswajeet@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "autoplant",
      logo: NotebookPen,
      plan: "Project Manager 24x7",
    },
    {
      name: "Admin",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Home",
      url: "/dashboard/home",
      icon: HomeIcon,
      isActive: true,
      items: [
        {
          title: "Summary",
          url: "#",
        },
        {
          title: "My Task",
          url: "#",
        },
        {
          title: "Task Calendar",
          url: "#",
        },
      ],
    },
    {
      title: "Portfolio",
      url: "#",
      icon: Briefcase,
      items: [
        {
          title: "Customer Site",
          url: "#",
        },
        {
          title: "Project Templates",
          url: "#",
        },
        {
          title: "Supersonic plan",
          url: "#",
        },
        {
          title: "Kanban View",
          url: "#",
        },
      ],
    },
    {
      title: "Notifications",
      url: "#",
      icon: BellDotIcon,
      items: [
        {
          title: "Personal",
          url: "#",
        },
        {
          title: "Go-live",
          url: "#",
        },
        {
          title: "Others",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Saved Docs",
          url: "#",
        },
        {
          title: "Upload New",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
