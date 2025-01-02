import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, UserPlus } from 'lucide-react';
import { calculateDuration } from '@/lib/utils';
import { EditTaskDialog } from './edit-task-dialog';
import { AssignTaskDialog } from './assign-task-dialog';
import { Task, Assignment } from '@/types/types';

interface TaskRowProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onAssign: (taskId: number, assignments: Omit<Assignment, 'id'>[]) => void;
}

export function TaskRow({ task, onUpdate, onDelete, onAssign }: TaskRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell>{task.index}</TableCell>
        <TableCell>{task.name}</TableCell>
        <TableCell>{task.startDate.toLocaleDateString()}</TableCell>
        <TableCell>{task.endDate.toLocaleDateString()}</TableCell>
        <TableCell>{calculateDuration(task.startDate, task.endDate)} days</TableCell>
        <TableCell>{task.actualStart?.toLocaleDateString() || '-'}</TableCell>
        <TableCell>{task.actualEnd?.toLocaleDateString() || '-'}</TableCell>
        <TableCell>
          {task.actualStart && task.actualEnd 
            ? `${calculateDuration(task.actualStart, task.actualEnd)} days` 
            : '-'}
        </TableCell>
        <TableCell>{task.progress}%</TableCell>
        <TableCell>{task.clientSpoc}</TableCell>
        <TableCell>{task.apSpoc}</TableCell>
        <TableCell>{task.projectManager}</TableCell>
        <TableCell>
          {task.assignments.map(assignment => (
            <div key={assignment.id} className="text-sm">
              {assignment.employeeName} ({assignment.percentage}%)
            </div>
          ))}
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssignDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <EditTaskDialog
        task={task}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onUpdate={onUpdate}
      />

      <AssignTaskDialog
        task={task}
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={(assignments) => onAssign(task.id, assignments)}
      />
    </>
  );
}