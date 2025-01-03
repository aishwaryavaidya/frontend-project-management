import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from '@/types/types';

interface BulkProgressContentProps {
  selectedTasks: Task[];
  onUpdate: (updates: Partial<Task>[]) => void;
  onClose: () => void;
}

export function BulkProgressContent({ selectedTasks, onUpdate, onClose }: BulkProgressContentProps) {
  const [progress, setProgress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = selectedTasks.map(task => ({
      id: task.id,
      progress: Number(progress),
    }));
    onUpdate(updates);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Progress (%)</Label>
        <Input
          type="number"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(e.target.value)}
          placeholder="Enter progress percentage"
        />
      </div>
      <Button type="submit" className="w-full">Update Progress</Button>
    </form>
  );
}