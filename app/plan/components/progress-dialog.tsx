"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Task } from '../lib/types';
import { cn } from '@/lib/utils';

interface ProgressDialogProps {
    task: Task;
    onUpdate: (taskId: string, progress: number, actualStartDate?: Date, actualEndDate?: Date) => void;
    trigger: React.ReactNode;
  }
  
  export function ProgressDialog({ task, onUpdate, trigger }: ProgressDialogProps) {
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(task.progress);
    const [actualStartDate, setActualStartDate] = useState<Date | undefined>(task.actualStartDate);
    const [actualEndDate, setActualEndDate] = useState<Date | undefined>(task.actualEndDate);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdate(task.id, progress, actualStartDate, actualEndDate);
      setOpen(false);
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Task Progress</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>
  
            <div className="space-y-2">
              <Label>Actual Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !actualStartDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {actualStartDate ? format(actualStartDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={actualStartDate}
                    onSelect={setActualStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
  
            <div className="space-y-2">
              <Label>Actual End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !actualEndDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {actualEndDate ? format(actualEndDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={actualEndDate}
                    onSelect={setActualEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
  
            <Button type="submit" className="w-full">Update Progress</Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }