import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from '@/types/types';

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedTask: Task) => void;
}

export function EditTaskDialog({ task, open, onOpenChange, onUpdate }: EditTaskDialogProps) {
  const [formData, setFormData] = useState({
    name: task.name,
    actualStart: task.actualStart?.toISOString().split('T')[0] || '',
    actualEnd: task.actualEnd?.toISOString().split('T')[0] || '',
    progress: task.progress,
    clientSpoc: task.clientSpoc,
    apSpoc: task.apSpoc,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...task,
      name: formData.name,
      actualStart: formData.actualStart ? new Date(formData.actualStart) : undefined,
      actualEnd: formData.actualEnd ? new Date(formData.actualEnd) : undefined,
      progress: Number(formData.progress),
      clientSpoc: formData.clientSpoc,
      apSpoc: formData.apSpoc,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Task Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <Label>Actual Start Date</Label>
            <Input
              type="date"
              value={formData.actualStart}
              onChange={(e) => setFormData(prev => ({ ...prev, actualStart: e.target.value }))}
            />
          </div>
          <div>
            <Label>Actual End Date</Label>
            <Input
              type="date"
              value={formData.actualEnd}
              onChange={(e) => setFormData(prev => ({ ...prev, actualEnd: e.target.value }))}
            />
          </div>
          <div>
            <Label>Progress (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData(prev => ({ ...prev, progress: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label>Client SPOC</Label>
            <Input
              value={formData.clientSpoc}
              onChange={(e) => setFormData(prev => ({ ...prev, clientSpoc: e.target.value }))}
            />
          </div>
          <div>
            <Label>AP SPOC</Label>
            <Input
              value={formData.apSpoc}
              onChange={(e) => setFormData(prev => ({ ...prev, apSpoc: e.target.value }))}
            />
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}