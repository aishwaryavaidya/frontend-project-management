import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from '@/types/types';

interface AddTaskDialogProps {
  milestoneId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (task: Partial<Task>) => void;
}

export function AddTaskDialog({ open, onOpenChange, onAdd }: AddTaskDialogProps) {
  const [taskName, setTaskName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientSpoc, setClientSpoc] = useState("");
  const [apSpoc, setApSpoc] = useState("");
  const [projectManager, setProjectManager] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name: taskName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      progress: 0,
      clientSpoc,
      apSpoc,
      projectManager,
      assignments: []
    });
    onOpenChange(false);
    // Reset form
    setTaskName("");
    setStartDate("");
    setEndDate("");
    setClientSpoc("");
    setApSpoc("");
    setProjectManager("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Task Name</Label>
            <Input
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Client SPOC</Label>
            <Input
              value={clientSpoc}
              onChange={(e) => setClientSpoc(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>AP SPOC</Label>
            <Input
              value={apSpoc}
              onChange={(e) => setApSpoc(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Project Manager</Label>
            <Input
              value={projectManager}
              onChange={(e) => setProjectManager(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Add Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}