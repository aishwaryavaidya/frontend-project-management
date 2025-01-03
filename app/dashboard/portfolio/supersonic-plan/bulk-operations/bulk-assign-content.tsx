import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, Assignment } from '@/types/types';
import { employees } from '@/data/employee';

interface BulkAssignContentProps {
  selectedTasks: Task[];
  onUpdate: (updates: Partial<Task>[]) => void;
  onClose: () => void;
}

interface AssignmentInput {
  employeeId: string;
  percentage: string;
}

export function BulkAssignContent({ selectedTasks, onUpdate, onClose }: BulkAssignContentProps) {
  const [assignments, setAssignments] = useState<AssignmentInput[]>([
    { employeeId: "", percentage: "100" }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validAssignments = assignments
      .filter(a => a.employeeId && a.percentage)
      .map(a => {
        const employee = employees.find(emp => emp.id.toString() === a.employeeId);
        if (!employee) throw new Error("Employee not found");
        
        return {
          id: Date.now(),
          employeeId: employee.id,
          employeeName: employee.name,
          role: employee.role,
          percentage: Number(a.percentage)
        };
      });

    if (validAssignments.length > 0) {
      const updates = selectedTasks.map(task => ({
        id: task.id,
        assignments: [...task.assignments, ...validAssignments]
      }));
      onUpdate(updates);
      onClose();
    }
  };

  // ... rest of the component implementation similar to BulkAssignDialog
}