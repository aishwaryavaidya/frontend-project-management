"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Task, TaskFormData, ValidationError } from '../_lib/types';
import { cn, hasCyclicDependency } from '../_lib/utils';

interface TaskFormDialogProps {
  tasks: Task[];
  onSubmit: (data: TaskFormData) => void;
  trigger: React.ReactNode;
}

export function TaskFormDialog({ tasks, onSubmit, trigger }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    duration: 1,
    startDate: new Date(),
    predecessors: [],
    isMilestone: false,
    isFinancialMilestone: false
  });
  const [errors, setErrors] = useState<ValidationError>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationError = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (formData.duration < 0) {
      newErrors.duration = 'Duration cannot be negative';
    }
    
    if (formData.isMilestone && formData.duration !== 0) {
      newErrors.duration = 'Milestones must have zero duration';
    }

    // Validate predecessors for cyclic dependencies
    for (const predId of formData.predecessors) {
      if (hasCyclicDependency(formData.name, predId, tasks)) {
        newErrors.predecessors = 'Cyclic dependency detected';
        break;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      setOpen(false);
      setFormData({
        name: '',
        duration: 1,
        startDate: new Date(),
        predecessors: [],
        isMilestone: false,
        isFinancialMilestone: false,
      });
    }
  };

  const handlePredecessorChange = (taskId: string) => {
    const updatedPredecessors = formData.predecessors.includes(taskId)
      ? formData.predecessors.filter(id => id !== taskId)
      : [...formData.predecessors, taskId];

    setFormData(prev => ({
      ...prev,
      predecessors: updatedPredecessors
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(errors.name && "border-red-500")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className={cn(errors.duration && "border-red-500")}
            />
            {errors.duration && <p className="text-sm text-red-500">{errors.duration}</p>}
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {tasks.length > 0 && (
            <div className="space-y-2">
              <Label>Predecessors</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-2 py-1">
                    <input
                      type="checkbox"
                      id={`pred-${task.id}`}
                      checked={formData.predecessors.includes(task.id)}
                      onChange={() => handlePredecessorChange(task.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor={`pred-${task.id}`} className="text-sm">
                      {task.name}
                    </label>
                  </div>
                ))}
              </div>
              {errors.predecessors && (
                <p className="text-sm text-red-500">{errors.predecessors}</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isMilestone"
              checked={formData.isMilestone}
              onChange={(e) => {
                const isMilestone = e.target.checked;
                setFormData({
                  ...formData,
                  isMilestone,
                  duration: isMilestone ? 0 : formData.duration,
                });
              }}
              className="h-4 w-4"
            />
            <Label htmlFor="isMilestone">Mark as Milestone</Label>
          </div>

          <Button type="submit" className="w-full">Add Task</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}