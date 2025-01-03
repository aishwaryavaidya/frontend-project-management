import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Task } from '@/types/types';
import { BulkAssignContent } from './bulk-assign-content';
import { BulkDatesContent } from './bulk-dates-content';
import { BulkSpocContent } from './bulk-spoc-content';
import { BulkProgressContent } from './bulk-progress-content';

type ContentType = 'assign' | 'dates' | 'spoc' | 'progress';

interface BulkOperationsDialogProps {
  selectedTasks: Task[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBulkUpdate: (updates: Partial<Task>[]) => void;
}

export function BulkOperationsDialog({ 
  selectedTasks, 
  open, 
  onOpenChange, 
  onBulkUpdate 
}: BulkOperationsDialogProps) {
  const [activeContent, setActiveContent] = useState<ContentType>('assign');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Modify Selected Tasks ({selectedTasks.length})</DialogTitle>
        </DialogHeader>
        
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={activeContent === 'assign' ? 'default' : 'outline'}
            onClick={() => setActiveContent('assign')}
          >
            Assign Selected
          </Button>
          <Button 
            variant={activeContent === 'dates' ? 'default' : 'outline'}
            onClick={() => setActiveContent('dates')}
          >
            Add Dates
          </Button>
          <Button 
            variant={activeContent === 'spoc' ? 'default' : 'outline'}
            onClick={() => setActiveContent('spoc')}
          >
            Edit SPOC
          </Button>
          <Button 
            variant={activeContent === 'progress' ? 'default' : 'outline'}
            onClick={() => setActiveContent('progress')}
          >
            Edit Progress
          </Button>
        </div>

        <div className="mt-4">
          {activeContent === 'assign' && (
            <BulkAssignContent 
              selectedTasks={selectedTasks}
              onUpdate={onBulkUpdate}
              onClose={() => onOpenChange(false)}
            />
          )}
          {activeContent === 'dates' && (
            <BulkDatesContent 
              selectedTasks={selectedTasks}
              onUpdate={onBulkUpdate}
              onClose={() => onOpenChange(false)}
            />
          )}
          {activeContent === 'spoc' && (
            <BulkSpocContent 
              selectedTasks={selectedTasks}
              onUpdate={onBulkUpdate}
              onClose={() => onOpenChange(false)}
            />
          )}
          {activeContent === 'progress' && (
            <BulkProgressContent 
              selectedTasks={selectedTasks}
              onUpdate={onBulkUpdate}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}