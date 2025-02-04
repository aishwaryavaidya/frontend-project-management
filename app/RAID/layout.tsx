// app/(dashboard)/layout.tsx
import { ProjectProvider } from '@/context/ProjectContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProjectProvider>
      <div className="flex-1 space-y-4 p-8 pt-6">
        {children}
      </div>
    </ProjectProvider>
  )
}