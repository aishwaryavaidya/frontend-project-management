"use client"

import * as React from "react"
import {
  BellDotIcon,
  Briefcase,
  BookOpen,
  ActivityIcon,
  Command,
  Frame,
  NotebookPen,
  Map,
  MessageCircle,
  Settings2,
  HomeIcon,
  LockKeyhole
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
      plan: "Private access",
    },
  ],


  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: ActivityIcon,
      items: [
        {
          title: "Summary Overview",
          url: "dashboard/summary",
        },
        {
          title: "Project Overview",
          url: "/dashboard/project/plan",
        },
      ],
    },

    {
      title: "Home",
      url: "/dashboard/home/summary",
      icon: HomeIcon,
      isActive: true,
      items: [
        // {
        //   title: "Summary",
        //   url: "/dashboard/home/summary",
        // },
        {
          title: "Task Kanban",
          url: "/dashboard/home/my-task",
        },
        {
          title: "Task Calendar",
          url: "/dashboard/home/task-calendar",
        },
      ],
    },
    {
      title: "Portfolio",
      url: "/dashboard/portfolio/customer-site",
      icon: Briefcase,
      items: [
        {
          title: "My Projects",
          url: "/dashboard/portfolio/customer-site",
        },
        {
          title: "Project Templates",
          url: "/dashboard/project-templates",
        },
        {
          title: "Supersonic plan",
          url: "/dashboard/portfolio/supersonic-plan",
        },
        {
          title: "RAID Log",
          url: "/RAID/6340c2bb-eb17-471d-a5e4-4be19e4a9b53/raid",
        },
        {
          title: "KPI Tracker",
          url: "/dashboard/project/KPI",
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
      name: "Chats",
      url: "/dashboard/chat",
      icon: MessageCircle,
    },
    {
      name: "Admin Role Management",
      url: "/admin/users",
      icon: LockKeyhole,
    },
    // {
    //   name: "Travel",
    //   url: "#",
    //   icon: Map,
    // },
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
