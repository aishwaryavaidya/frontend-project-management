import React from 'react'
import Navbar from '@/components/Navbar'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


const DashboardWrapper = () => {
  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900 ">
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
        
          </main>
        </SidebarProvider>
      <main
        className='dark:bg-dark-bg flex w-full flex-col bg-gray-50 md-pl-64'>
            <Navbar />
        </main>
    </div>
  )
}

export default DashboardWrapper
