// app/RAID/[projectId]/raid/components/RaidTable.tsx
"use client"
import { useState, useEffect } from 'react'
import { useProject } from '@/context/ProjectContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MitigationPlanModal } from './MitigationPlanModal'
import { ActivitiesModal } from './ActivitiesModal'
import { ActionItemsModal } from './ActionItemsModal'
import { RemarksModal } from './RemarksModal'
// import { RaidFilters } from './RaidFilters'
import { PencilIcon, CheckIcon, XIcon, EyeIcon, PlusIcon, TrashIcon } from 'lucide-react'
import type { RAIDItem } from '@/types/raid'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RaidTableProps {
  raids: RAIDItem[];
  projectId: string;
  onEdit: (raid: RAIDItem) => void;
}

export function RaidTable2({ raids, projectId, onEdit }: RaidTableProps) {
  const { raidItems, refreshProject } = useProject()
  const [editedData, setEditedData] = useState<Partial<RAIDItem>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [openedModal, setOpenedModal] = useState<{ type: string; id: string } | null>(null)
  

  // Date formatting utility
  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-'
    try {
      const d = new Date(date)
      const day = String(d.getDate()).padStart(2, '0')
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      return `${day}/${month}/${year}`
    } catch (error) {
      console.error('Error formatting date:', error)
      return '-'
    }
  }

  // Truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  // Color utilities
  const getStatusColor = (status: string | undefined): string => {
    switch (status?.trim().toLowerCase()) {
      case 'open': return 'bg-yellow-500 text-white'
      case 'in progress': return 'bg-blue-600 text-white'
      case 'closed': return 'bg-green-600 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string | undefined): string => {
    switch (priority) {
      case 'Extreme': return 'bg-red-600 text-white'
      case 'High': return 'bg-orange-600 text-white'
      case 'Medium': return 'bg-yellow-500 text-white'
      case 'Low': return 'bg-green-600 text-white'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Date handling utilities
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return ''
    try {
      return new Date(date).toISOString().split('T')[0]
    } catch (error) {
      console.error('Invalid date:', date)
      return ''
    }
  }

  const handleDateChange = (id: string, field: string, value: string) => {
    try {
      const date = value ? new Date(value) : null
      handleEdit(id, field, date)
    } catch (error) {
      console.error(`Error parsing date for ${field}:`, error)
    }
  }

  // Edit and delete handlers
  const handleEdit = (id: string, field: string, value: any) => {
    setEditedData(prev => ({ ...prev, [field]: value }))
  }

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
 // to save modal data on DB
  const saveField = async (id: string, field: string, value: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/raid-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
  
      if (!response.ok) throw new Error('Failed to save field');
      
      await refreshProject(); // Refresh data from server
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Failed to save field:', error);
      toast.error('Failed to save changes');
    }
  };

  // Modal button renderer
  const renderModalButton = (
    label: string,
    data: any[] | undefined,
    modalType: string,
    itemId: string
  ) => {
    const hasData = Array.isArray(data) && data.length > 0
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
        onClick={() => setOpenedModal({ type: modalType, id: itemId })}
        title={hasData ? `View ${modalType}` : `Add ${modalType}`}
      >
        {hasData ? (
          <>
            <EyeIcon className="h-4 w-4 mr-1" />
            {label}
          </>
        ) : (
          <>
            <PlusIcon className="h-4 w-4 mr-1" />
            {label}
          </>
        )}
      </Button>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1600px]">
          <thead className="bg-muted">
            <tr>
            <th className="p-2 w-12">No.</th>
              <th className="p-2">Milestone</th>
              <th className="p-2">Date Raised</th>
              <th className="p-2 w-32">Type</th>
              <th className="p-2">Sprint Date</th>
              <th className="p-2">Category</th>
              <th className="p-2">Probability</th>
              <th className="p-2 w-48">Preventive Action</th>
              <th className="p-2">Status</th>
              <th className="p-2 w-48">Impact</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Confirmed By</th>
              <th className="p-2">Mitigation</th>
              <th className="p-2">Owner</th>
              <th className="p-2">Closed Date</th>
              <th className="p-2">Activities</th>
              <th className="p-2">Actions</th>
              <th className="p-2">Assigned To</th>
              <th className="p-2">Remarks</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {raids.map((item, index) => (
              <tr key={item.id} className="border-t hover:bg-muted/50">
                {/* Index Number */}
                <td className="p-2 text-center">{index + 1}.</td>
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
                    item.milestoneNo ? `M-${item.milestoneNo}` : ''
                  )}
                </td>

                {/* Date Raised */}
                <td className="p-2 whitespace-nowrap">
                  {editingId === item.id ? (
                    <Input
                      type="date"
                      value={formatDateForInput(editedData.dateRaised ?? item.dateRaised)}
                      onChange={e => handleDateChange(item.id, 'dateRaised', e.target.value)}
                      className="w-40 "
                    />
                  ) : (
                    item.dateRaised ? formatDate(item.dateRaised) : '-'
                  )}
                </td>

                {/* Type */}
                <td className="p-2 w-32 truncate" title={item.type || '-'}>
                  {editingId === item.id ? (
                    <Input
                      value={editedData.type ?? item.type ?? ''}
                      onChange={e => handleEdit(item.id, 'type', e.target.value)}
                      className="w-32"
                    />
                  ) : (
                    truncateText(item.type || '-', 15)
                  )}
                </td>

                {/* Sprint Date */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <Input
                      type="date"
                      value={formatDateForInput(editedData.sprintDate ?? item.sprintDate)}
                      onChange={e => handleDateChange(item.id, 'sprintDate', e.target.value)}
                      className="w-40"
                    />
                  ) : (
                    item.sprintDate ? formatDate(item.sprintDate) : '-'
                  )}
                </td>

                {/* Category */}
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
                <td className="p-2 w-48 truncate" title={item.preventiveAction || '-'} >
                  {editingId === item.id ? (
                    <Input
                      value={editedData.preventiveAction ?? item.preventiveAction ?? ''}
                      onChange={e => handleEdit(item.id, 'preventiveAction', e.target.value)}
                    />
                  ) : (
                    truncateText(item.preventiveAction || '-', 20)
                  )}
                </td>

                {/* Status */}
                <td className="p-2 justify-between items-center">
                  {editingId === item.id ? (
                    <Select
                      value={editedData.status ?? item.status ?? ''}
                      onValueChange={v => handleEdit(item.id, 'status', v)}
                    >
                      <SelectTrigger className={cn("h-8 w-28", getStatusColor(editedData.status?? ''))}>
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
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap", getStatusColor(item.status?? ''))}>
                      {item.status}
                    </span>
                  )}
                </td>

                {/* Impact */}
                <td className="p-2 w-48 truncate" title={item.impact || '-'}>
                  {editingId === item.id ? (
                    <Input
                      value={editedData.impact ?? item.impact ?? ''}
                      onChange={e => handleEdit(item.id, 'impact', e.target.value)}
                      className="w-28"
                    />
                  ) : (
                    truncateText(item.impact || '-', 20)
                  )}
                </td>

                {/* Priority */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <Select
                      value={editedData.priority ?? item.priority ?? ''}
                      onValueChange={v => handleEdit(item.id, 'priority', v)}
                    >
                      <SelectTrigger className={cn("h-8 w-28", getPriorityColor(editedData.priority?? ''))}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Extreme', 'High', 'Medium', 'Low'].map(opt => (
                          <SelectItem key={opt} value={opt} className={getPriorityColor(opt)}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getPriorityColor(item.priority?? ''))}>
                      {item.priority}
                    </span>
                  )}
                </td>

                {/* Confirmed By with Date */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <Input
                      value={editedData.confirmedBy ?? item.confirmedBy ?? ''}
                      onChange={e => handleEdit(item.id, 'confirmedBy', e.target.value)}
                      className="w-28"
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span>{item.confirmedBy}</span>
                      {item.confirmationDate && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.confirmationDate)}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Mitigation Plan */}
                <td className="p-2">
                  {renderModalButton('Plan', item.mitigationPlan, 'mitigation', item.id)}
                  {openedModal?.type === 'mitigation' && openedModal.id === item.id && (
                    <MitigationPlanModal
                    open={true}
                    onClose={() => setOpenedModal(null)}
                    plan={editingId === item.id ? editedData.mitigationPlan ?? item.mitigationPlan : item.mitigationPlan}
                    onSave={async (newPlan) => {
                        await handleEdit(item.id, 'mitigationPlan', newPlan);
                        await saveField(item.id, 'mitigationPlan', newPlan);
                        setOpenedModal(null);
                    }}
                    />
                  )}
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

                {/* Closed Date */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <Input
                      type="date"
                      value={formatDateForInput(editedData.dateClosed ?? item.dateClosed)}
                      onChange={e => handleDateChange(item.id, 'dateClosed', e.target.value)}
                      className="w-40"
                    />
                  ) : (
                    item.dateClosed ? formatDate(item.dateClosed) : '-'
                  )}
                </td>

                {/* Activities Log */}
                <td className="p-2">
                  {renderModalButton('Activities', item.activitiesLog, 'activities', item.id)}
                  {openedModal?.type === 'activities' && openedModal.id === item.id && (
                    <ActivitiesModal
                    open={true}
                    onClose={() => setOpenedModal(null)}
                    activities={editingId === item.id ? editedData.activitiesLog ?? item.activitiesLog : item.activitiesLog}
                    onSave={(newActivities) => {
                      handleEdit(item.id, 'activitiesLog', newActivities);
                      saveField(item.id, 'activitiesLog', newActivities);
                    }}
                    />
                  )}
                </td>

                {/* Action Items */}
                <td className="p-2">
                  {renderModalButton('Actions', item.actionItems, 'actions', item.id)}
                  {openedModal?.type === 'actions' && openedModal.id === item.id && (
                    <ActionItemsModal
                    open={true}
                    onClose={() => setOpenedModal(null)}
                    items={editingId === item.id ? editedData.actionItems ?? item.actionItems : item.actionItems}
                    onSave={(newItems) => {
                      handleEdit(item.id, 'actionItems', newItems);
                      saveField(item.id, 'actionItems', newItems);
                    }}
                    />
                  )}
                </td>

                {/* Assigned To with Date */}
                <td className="p-2">
                  {editingId === item.id ? (
                    <Input
                      value={editedData.assignedTo ?? item.assignedTo ?? ''}
                      onChange={e => handleEdit(item.id, 'assignedTo', e.target.value)}
                      className="w-28"
                    />
                  ) : (
                    <div className="flex flex-col">
                      <span>{item.assignedTo}</span>
                      {item.assignedOn && (
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.assignedOn)}
                        </span>
                      )}
                    </div>
                  )}
                </td>

                {/* Remarks */}
                <td className="p-2">
                  {renderModalButton('Remarks', item.remarks, 'remarks', item.id)}
                  {openedModal?.type === 'remarks' && openedModal.id === item.id && (
                    <RemarksModal
                    open={true}
                    onClose={() => setOpenedModal(null)}
                    remarks={editingId === item.id ? editedData.remarks ?? item.remarks : item.remarks}
                    onSave={(newRemarks) => {
                      handleEdit(item.id, 'remarks', newRemarks);
                      saveField(item.id, 'remarks', newRemarks);
                    }}
                    />
                  )}
                </td>

                {/* Edit/Delete Controls */}
                <td className="p-2">
                  <div className="flex gap-1">
                    {editingId === item.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={saveChanges}>
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                          <XIcon className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(item.id)}>
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <TrashIcon className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}