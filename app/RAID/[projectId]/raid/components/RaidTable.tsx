// app/RAID/[projectId]/raid/components/RaidTable.tsx
"use client"
import { useState, useEffect } from 'react'
import { useProject } from '@/context/ProjectContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, getStatusColor, getPriorityColor, getCategoryColor } from '@/lib/utils/raid'
import { MitigationPlanModal } from './MitigationPlanModal'
import { ActivitiesModal } from './ActivitiesModal'
import { ActionItemsModal } from './ActionItemsModal'
import { RemarksModal } from './RemarksModal'
import { PencilIcon, CheckIcon, XIcon, EyeIcon, PlusIcon, TrashIcon  } from 'lucide-react'
import type { RAIDItem } from '@/types/raid'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RaidTableProps {
    raids: RAIDItem[];
    projectId: string;
    onEdit: (raid: RAIDItem) => void;
  }

export function RaidTable({ raids, projectId, onEdit }: RaidTableProps) {
  const { raidItems, refreshProject } = useProject()
  const [editedData, setEditedData] = useState<Partial<RAIDItem>>({})
  const [editingId, setEditingId] = useState<string | null>(null)

// Helper function to safely format dates for input fields
const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.toISOString().slice(0, 16)
  } catch (error) {
    console.error('Invalid date:', date)
    return ''
  }
}
// Helper function to safely handle date changes
const handleDateChange = (id: string, field: string, value: string) => {
  try {
    const date = value ? new Date(value) : null
    handleEdit(id, field, date)
  } catch (error) {
    console.error(`Error parsing date for ${field}:`, error)
    // toast.error(`Invalid date format for ${field}`)
  }
}

  // Auto-update confirmation date when confirmedBy changes
useEffect(() => {
  if (editingId && editedData.confirmedBy && !editedData.confirmationDate) {
    handleEdit(editingId!, 'confirmationDate', new Date())
  }
}, [editedData.confirmedBy])

// Auto-update assignedOn when assignedTo changes
useEffect(() => {
  if (editedData.assignedTo && !editedData.assignedOn) {
    handleEdit(editingId!, 'assignedOn', new Date())
  }
}, [editedData.assignedTo])

// Hanling edit functionality
  const handleEdit = (id: string, field: string, value: any) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }


  // Adding delete row functionality
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const response = await fetch(`/api/projects/${projectId}/raid-items/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete item')
      
      await refreshProject()
      toast.success('Item deleted successfully')
    } catch (error) {
      console.error('Failed to delete item:', error)
      toast.error('Failed to delete item')
    }
  }

  // Saving changes functionality
  const saveChanges = async () => {
    if (!editingId) return
    
    try {
      await fetch(`/api/projects/${projectId}/raid-items/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData)
      })
      await refreshProject()
      setEditingId(null)
      setEditedData({})
      toast.success('Changes saved successfully')
    } catch (error) {
      console.error('Failed to save changes:', error)
      toast.error('Failed to save changes')
    }
  }

  const renderActionButton = (
    label: string, 
    data: any[] | undefined, 
    ModalComponent: any, 
    onSave: (data: any) => void
  ) => {
    const hasData = Array.isArray(data) && data.length > 0
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => ModalComponent({ data, onSave })}
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
      >
        {hasData ? (
          <>
            <EyeIcon className="h-4 w-4 mr-1" />
            View {label}
          </>
        ) : (
          <>
            <PlusIcon className="h-4 w-4 mr-1" />
            Add {label}
          </>
        )}
      </Button>
    )
  }




  return (
    <div className="border rounded-lg overflow-hidden">
      <div className= "overflow-x-auto">
      <table className="w-full text-sm min-w-[1600px]">
        <thead className="bg-muted">
          <tr>
            <th className="p-2">Milestone</th>
            <th className="p-2">Date Raised</th>
            <th className="p-2">Type</th>
            <th className="p-2">Sprint Date</th>
            <th className="p-2">Category</th>
            <th className="p-2">Probability</th>
            <th className="p-2">Preventive Action</th>
            <th className="p-2">Status</th>
            <th className="p-2">Impact</th>
            <th className="p-2">Priority</th>
            <th className="p-2">Confirmed By</th>
            <th className="p-2">Mitigation</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Closed Date</th>
            <th className="p-2">Activities</th>
            <th className="p-2">Actions</th>
            <th className="p-2">Assigned</th>
            <th className="p-2">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {raids.map(item => (
            <tr key={item.id} className="border-t hover:bg-muted/50">
              {/* Milestone No */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    value={editedData.milestoneNo ?? item.milestoneNo ?? ''}
                    onChange={e => handleEdit(item.id, 'milestoneNo', parseInt(e.target.value))}
                    className="h-8 w-20"
                  />
                ) : (
                  item.milestoneNo
                )}
              </td>

              {/* Date Raised */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    type="datetime-local"
                    value={editedData.dateRaised?.toISOString().slice(0, 16) ?? item.dateRaised?.toISOString().slice(0, 16) ?? ''}
                    onChange={e => handleEdit(item.id, 'dateRaised', new Date(e.target.value))}
                    className="w-40"
                  />
                ) : (
                  item.dateRaised ? formatDate(item.dateRaised) : '-'
                )}
              </td>

              {/* Type */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    value={editedData.type ?? item.type ?? ''}
                    onChange={e => handleEdit(item.id, 'type', e.target.value)}
                    className="w-28"
                  />
                ) : (
                  item.type
                )}
              </td>

              {/* Sprint Date */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    type="datetime-local"
                    value={editedData.sprintDate?.toISOString().slice(0, 16) ?? item.sprintDate?.toISOString().slice(0, 16) ?? ''}
                    onChange={e => handleEdit(item.id, 'sprintDate', new Date(e.target.value))}
                    className="w-40"
                  />
                ) : (
                  item.sprintDate ? formatDate(item.sprintDate) : '-'
                )}
              </td>

              {/* Category Dropdown */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Select
                    value={editedData.category ?? item.category ?? ''}
                    onValueChange={v => handleEdit(item.id, 'category', v)}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Risk', 'Assumption', 'Issue', 'Dependency'].map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  item.category
                )}
              </td>

              {/* Probability */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editedData.probability ?? item.probability ?? ''}
                    onChange={e => handleEdit(item.id, 'probability', parseInt(e.target.value))}
                    className="w-20"
                  />
                ) : (
                  item.probability ? `${item.probability}%` : '-'
                )}
              </td>

              {/* Preventive Action */}
              <td className="p-2 max-w-[200px] truncate" title={item.preventiveAction ?? ''}>
                {editingId === item.id ? (
                  <Input
                    value={editedData.preventiveAction ?? item.preventiveAction ?? ''}
                    onChange={e => handleEdit(item.id, 'preventiveAction', e.target.value)}
                  />
                ) : (
                  item.preventiveAction
                )}
              </td>

              {/* Status Dropdown */}
              <td className="p-2">
                  {editingId === item.id ? (
                    <Select
                      value={editedData.status ?? item.status ?? ''}
                      onValueChange={v => handleEdit(item.id, 'status', v)}
                    >
                      <SelectTrigger className={cn("h-8 w-28", getStatusColor(editedData.status ?? item.status?? ''))}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {['open', 'in progress', 'closed'].map(opt => (
                          <SelectItem key={opt} value={opt} className={getStatusColor(opt)}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", 
                      getStatusColor(item.status?? ''))}>
                      {item.status}
                    </span>
                  )}
                </td>

              {/* Impact */}
              <td className="p-2 max-w-[100px] truncate" title={item.impact ?? ''}>
                {editingId === item.id ? (
                  <Input
                    value={editedData.impact ?? item.impact ?? ''}
                    onChange={e => handleEdit(item.id, 'impact', e.target.value)}
                    className="w-28"
                  />
                ) : (
                  item.impact
                )}
              </td>

              {/* Priority Dropdown */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Select
                    value={editedData.priority ?? item.priority ?? ''}
                    onValueChange={v => handleEdit(item.id, 'priority', v)}
                  >
                    <SelectTrigger className="h-8 w-28">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Extreme', 'High', 'Medium', 'Low'].map(opt => (
                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  item.priority
                )}
              </td>

              {/* Confirmed By */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    value={editedData.confirmedBy ?? item.confirmedBy ?? ''}
                    onChange={e => handleEdit(item.id, 'confirmedBy', e.target.value)}
                    className="w-28"
                  />
                ) : (
                  item.confirmedBy
                )}
              </td>

              {/* Mitigation Plan */}
              <td className="p-2">
                <MitigationPlanModal 
                  plan={item.mitigationPlan}
                  onSave={(newPlan) => handleEdit(item.id, 'mitigationPlan', newPlan)}
                />
              </td>

              {/* Owner */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    value={editedData.owner ?? item.owner ?? ''}
                    onChange={e => handleEdit(item.id, 'owner', e.target.value)}
                    className="w-28"
                  />
                ) : (
                  item.owner
                )}
              </td>

              {/* Date Closed */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    type="datetime-local"
                    value={editedData.dateClosed?.toISOString().slice(0, 16) ?? item.dateClosed?.toISOString().slice(0, 16) ?? ''}
                    onChange={e => handleEdit(item.id, 'dateClosed', new Date(e.target.value))}
                    className="w-40"
                  />
                ) : (
                  item.dateClosed ? formatDate(item.dateClosed) : '-'
                )}
              </td>

              {/* Activities Log */}
              <td className="p-2">
                <ActivitiesModal 
                  activities={item.activitiesLog}
                  onSave={(newActivities) => handleEdit(item.id, 'activitiesLog', newActivities)}
                />
              </td>

              {/* Action Items */}
              <td className="p-2">
                <ActionItemsModal 
                  items={item.actionItems}
                  onSave={(newItems) => handleEdit(item.id, 'actionItems', newItems)}
                />
              </td>

              {/* Assigned To */}
              <td className="p-2">
                {editingId === item.id ? (
                  <Input
                    value={editedData.assignedTo ?? item.assignedTo ?? ''}
                    onChange={e => handleEdit(item.id, 'assignedTo', e.target.value)}
                    className="w-28"
                  />
                ) : (
                  item.assignedTo
                )}
              </td>

              {/* Remarks */}
              <td className="p-2">
                <RemarksModal 
                  remarks={item.remarks}
                  onSave={(newRemarks) => handleEdit(item.id, 'remarks', newRemarks)}
                />
              </td>

              {/* Edit Controls */}
              <td className="p-2">
                {editingId === item.id ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={saveChanges}>
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <XIcon className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(item.id)}>
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  )
}