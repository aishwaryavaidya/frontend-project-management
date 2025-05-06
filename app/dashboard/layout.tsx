import React from 'react'
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { AppSidebar } from "@/components/app-sidebar"
import AuthenticatedAvatar from '@/components/global/AuthenticatedAvatar'
import { Session } from 'next-auth'
import { Button} from '@/components/ui/button'
import { ChatPage } from './chat/ChatPage'
import Link from 'next/link' 
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from '@/components/mode-toggle'
import { ChatBox } from './chat/ChatBox'


export default async function Layout({ children }: { children: React.ReactNode}) {
  const session = await getServerSession(authOptions);
  return (
    <SidebarProvider >
    <AppSidebar/>
    <SidebarInset>
      <header className="flex z-30 bg-white h-11 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 sticky top-0 z-30 dark:bg-black">
        <div className="flex  items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard/summary">
                  Summary Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Project</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className='fixed right-4'>
            <span className="px-2"><ChatBox /></span>
            <span className="px-2"><ModeToggle /></span>
            <span>
            {session ? (
              <AuthenticatedAvatar session={session} />
            ) : (
              <Button asChild variant={"outline"} className="px-2 bg-red-500 text-white font-semibold">
                <Link href="/login">Log in</Link>
              </Button>
            )}
            </span>
          </div>
          
        </div>
      </header>
      <main>
        {children}
      </main>
    </SidebarInset>
  </SidebarProvider>
  )
}

