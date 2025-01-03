import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Task } from '@/types/types';

interface BulkSpocContentProps {
  selectedTasks: Task[];
  onUpdate: (updates: Partial<Task>[]) => void;
  onClose: () => void;
}

export function BulkSpocContent({ selectedTasks, onUpdate, onClose }: BulkSpocContentProps) {
  const [clientSpoc, setClientSpoc] = useState("");
  const [apSpoc, setApSpoc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = selectedTasks.map(task => ({
      id: task.id,
      ...(clientSpoc && { clientSpoc }),
      ...(apSpoc && { apSpoc }),
    }));
    onUpdate(updates);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Client SPOC</Label>
        <Input
          value={clientSpoc}
          onChange={(e) => setClientSpoc(e.target.value)}
          placeholder="Enter client SPOC name"
        />
      </div>
      <div>
        <Label>AP SPOC</Label>
        <Input
          value={apSpoc}
          onChange={(e) => setApSpoc(e.target.value)}
          placeholder="Enter AP SPOC name"
        />
      </div>
      <Button type="submit" className="w-full">Update SPOC</Button>
    </form>
  );
}