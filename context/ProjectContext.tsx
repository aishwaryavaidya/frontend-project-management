// context/ProjectContext.tsx

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { RAIDItem, Project } from '@/types/raid'

type ProjectContextType = {
  project: Project | null
  raidItems: RAIDItem[]
  loading: boolean
  refreshProject: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType>({
  project: null,
  raidItems: [],
  loading: true,
  refreshProject: async () => {}
})

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const [project, setProject] = useState<Project | null>(null)
  const [raidItems, setRaidItems] = useState<RAIDItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      const [projectRes, raidRes] = await Promise.all([
        fetch(`/api/projects/${params.projectId}`),
        fetch(`/api/projects/${params.projectId}/raid-items`)
      ])
      
      if (!projectRes.ok) throw new Error(`Project fetch failed: ${projectRes.status}`)
      if (!raidRes.ok) throw new Error(`RAID items fetch failed: ${raidRes.status}`)
  
      const [projectData, raidData] = await Promise.all([
        projectRes.json(),
        raidRes.json()
      ])
  
      setProject(projectData)
      setRaidItems(raidData)
    } catch (error) {
      console.error('Failed to fetch project data:', error)
      // Consider adding toast notifications here
    } finally {
      setLoading(false)
    }
  }
  
  

  useEffect(() => {
    if (params.projectId) {
      fetchProjectData()
    }
  }, [params.projectId])

  return (
    <ProjectContext.Provider value={{
      project,
      raidItems,
      loading,
      refreshProject: fetchProjectData
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProject = () => useContext(ProjectContext)