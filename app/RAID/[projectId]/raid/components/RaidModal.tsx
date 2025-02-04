// app/RAID/[projectId]/raid/components/RaidModal.tsx
"use client"

import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getDefaultRAIDItem, validateRAIDItem, getStatusColor, getPriorityColor } from '@/lib/utils/raid'
import type { RAIDItem } from '@/types/raid'
import { cn } from '@/lib/utils'

export function RaidModal({
  mode,
  projectId,
  initialData,
  onClose,
  onSubmit
}: {
  mode: 'add' | 'edit',
  projectId: string,
  initialData?: RAIDItem | null,
  onClose: () => void,
  onSubmit: (data: RAIDItem) => void
}) {
  const { register, handleSubmit, reset, setValue, watch } = useForm<RAIDItem>({
    defaultValues: getDefaultRAIDItem(projectId)
  })

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset(initialData)
    }
  }, [mode, initialData, reset])

  const processSubmit = (data: RAIDItem) => {
    const validation = validateRAIDItem(data)
    if (!validation.valid) {
      alert(validation.errors.join('\n'))
      return
    }
    onSubmit(data)
  }

  return (
    <Dialog open={!!mode} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New RAID Item' : 'Edit RAID Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(processSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <Select
              value={watch('category') || ''}
              onValueChange={v => setValue('category', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {['Risk', 'Assumption', 'Issue', 'Dependency'].map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status *</label>
            <Select
              value={watch('status') || ''}
              onValueChange={v => setValue('status', v)}
            >
              <SelectTrigger className={cn(getStatusColor(watch('status')?? 'open'), "border")}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {['open', 'in progress', 'closed'].map(opt => (
                  <SelectItem key={opt} value={opt} className={getStatusColor(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={watch('priority') || ''}
              onValueChange={v => setValue('priority', v)}
            >
              <SelectTrigger className={cn(getPriorityColor(watch('priority')?? 'Medium'), "border")}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {['Extreme', 'High', 'Medium', 'Low'].map(opt => (
                  <SelectItem key={opt} value={opt} className={getPriorityColor(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type/Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Input {...register('type')} placeholder="Type" />
          </div>

          {/* Impact */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Impact</label>
            <Input {...register('impact')} placeholder="Impact" />
          </div>

          {/* Preventive Action */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preventive Action</label>
            <Input {...register('preventiveAction')} placeholder="Preventive Action" />
          </div>

          {/* Probability */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Probability (%)</label>
            <Input 
              type="number" 
              min="0" 
              max="100"
              {...register('probability', { valueAsNumber: true })} 
              placeholder="Probability (0-100)" 
            />
          </div>

          {/* Owner */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Owner</label>
            <Input {...register('owner')} placeholder="Owner" />
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assigned To</label>
            <Input {...register('assignedTo')} placeholder="Assigned To" />
          </div>

          {/* Confirmed By */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirmed By</label>
            <Input {...register('confirmedBy')} placeholder="Confirmed By" />
          </div>

          <div className="col-span-2 flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Create Item' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}