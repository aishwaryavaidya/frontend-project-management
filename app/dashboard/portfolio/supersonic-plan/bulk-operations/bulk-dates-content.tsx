import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from '@/types/types';

interface BulkDatesContentProps {
  selectedTasks: Task[];
  onUpdate: (updates: Partial<Task>[]) => void;
  onClose: () => void;
}

export function BulkDatesContent({ selectedTasks, onUpdate, onClose }: BulkDatesContentProps) {
  const [actualStart, setActualStart] = useState("");
  const [actualEnd, setActualEnd] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = selectedTasks.map(task => ({
      id: task.id,
      actualStart: actualStart ? new Date(actualStart) : undefined,
      actualEnd: actualEnd ? new Date(actualEnd) : undefined,
    }));
    onUpdate(updates);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Actual Start Date</Label>
        <Input
          type="date"
          value={actualStart}
          onChange={(e) => setActualStart(e.target.value)}
        />
      </div>
      <div>
        <Label>Actual End Date</Label>
        <Input
          type="date"
          value={actualEnd}
          onChange={(e) => setActualEnd(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full">Update Dates</Button>
    </form>
  );
}