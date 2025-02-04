// app/RAID/[projectId]/raid/page.tsx
"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useProject } from '@/context/ProjectContext'
import { RaidCharts } from './components/RaidCharts'
import { RaidTable } from './components/RaidTable'
import { RaidTable2 } from './components/RaidTable2'
import { RaidModal } from './components/RaidModal'
import { Button } from '@/components/ui/button'
import { PlusIcon } from 'lucide-react'
import { filterRaids } from '@/lib/utils/raid'
import type { RAIDItem } from '@/types/raid'



export default function RaidPage() {
  const params = useParams<{ projectId: string }>()
  const { raidItems, loading, refreshProject } = useProject()
  const [filters, setFilters] = useState({})
  const [selectedRaid, setSelectedRaid] = useState<RAIDItem | null>(null)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)

  const filteredRaids = filterRaids(raidItems, filters)

  const handleSubmit = async (data: RAIDItem) => {
    try {
      const url = modalMode === 'add' 
        ? `/api/projects/${params.projectId}/raid-items`
        : `/api/projects/${params.projectId}/raid-items/${selectedRaid?.id}`

      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to save RAID item')

      await refreshProject()
      setModalMode(null)
      setSelectedRaid(null)
    } catch (error) {
      console.error('Error saving RAID item:', error)
      alert('Failed to save changes. Please check the console for details.')
    }
  }

  return (
    <div className="p-6 min-h-screen space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-semibold text-red-500">RAID Log</h1>
          <p className="text-sm text-muted-foreground mb-3">
            Project ID: {params.projectId}
          </p>
          <p className="text-sm text-muted-foreground text-white ">
            Project Name: VICAT Kalburgi (Code-70000) 
          </p>
        </div>
        <Button onClick={() => setModalMode('add')}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <RaidCharts />

<RaidTable2
        raids={filteredRaids}
        projectId={params.projectId}
        onEdit={(raid) => {
          setSelectedRaid(raid)
          setModalMode('edit')
        }}
      />

      {modalMode && (
        <RaidModal 
          mode={modalMode}
          projectId={params.projectId}
          initialData={selectedRaid}
          onClose={() => {
            setModalMode(null)
            setSelectedRaid(null)
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}