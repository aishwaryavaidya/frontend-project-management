import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task, Assignment } from '@/types/types';
import { employees } from '@/data/employee';

interface AssignTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (assignments: Omit<Assignment, 'id'>[]) => void;
}

interface AssignmentInput {
  employeeId: string;
  percentage: string;
}

export function AssignTaskDialog({ task, open, onOpenChange, onAssign }: AssignTaskDialogProps) {
  const [assignments, setAssignments] = useState<AssignmentInput[]>([
    { employeeId: "", percentage: "100" }
  ]);

  const addAssignment = () => {
    setAssignments([...assignments, { employeeId: "", percentage: "" }]);
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validAssignments = assignments
      .filter(a => a.employeeId && a.percentage)
      .map(a => {
        const employee = employees.find(emp => emp.id.toString() === a.employeeId);
        if (!employee) throw new Error("Employee not found");
        
        return {
          employeeId: employee.id,
          employeeName: employee.name,
          role: employee.role,
          percentage: Number(a.percentage)
        };
      });

    if (validAssignments.length > 0) {
      onAssign(validAssignments);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Task: {task.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {assignments.map((assignment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Select
                value={assignment.employeeId}
                onValueChange={(value) => {
                  const newAssignments = [...assignments];
                  newAssignments[index].employeeId = value;
                  setAssignments(newAssignments);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} ({employee.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                max="100"
                value={assignment.percentage}
                onChange={(e) => {
                  const newAssignments = [...assignments];
                  newAssignments[index].percentage = e.target.value;
                  setAssignments(newAssignments);
                }}
                placeholder="Percentage"
                className="w-24"
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeAssignment(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addAssignment}>
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
          <Button type="submit">Save Assignments</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}