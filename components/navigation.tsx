"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  Users,
  LayoutDashboard
} from 'lucide-react'

type NavItem = {
  title: string
  href: string
  icon: React.ReactNode
}

export function Navigation() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      title: 'Order Entry',
      href: '/order-entry',
      icon: <ClipboardList className="h-5 w-5" />
    },
    {
      title: 'Resource Allocation',
      href: '/resource-allocation',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Project Manager',
      href: '/project-manager',
      icon: <FolderKanban className="h-5 w-5" />
    }
  ]
  
  return (
    <div
      className={cn(
        "h-screen bg-card flex flex-col border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-3 flex justify-between items-center border-b">
        <h2 className={cn("font-semibold truncate", collapsed && "opacity-0")}>
          PM Tool
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md transition-all hover:bg-accent",
              pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              collapsed && "justify-center"
            )}
          >
            {item.icon}
            <span className={cn("truncate", collapsed && "hidden")}>
              {item.title}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  )
} 