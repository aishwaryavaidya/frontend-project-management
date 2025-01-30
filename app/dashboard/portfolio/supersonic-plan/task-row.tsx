//task-row

import React, { useState } from 'react';
// import { TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, UserPlus } from 'lucide-react';
import { calculateDuration } from '@/lib/utils/utils';
import { EditTaskDialog } from './edit-task-dialog';
import { AssignTaskDialog } from './assign-task-dialog';
import { Task, Assignment } from '@/types/types';
import EmployeeAvatar from './EmployeeAvatar';
interface TaskRowProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onAssign: (taskId: number, assignments: Omit<Assignment, 'id'>[]) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function TaskRow({ 
    task, 
    isSelectionMode,
    isSelected,
    onSelect,
    onUpdate, 
    onDelete, 
    onAssign 
  }: TaskRowProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);


  return (
    <>
      <tr className='text-sm border border-gray-300'>
      {isSelectionMode && (
        <td>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="w-4 h-4"
            />
          </td>
        )}
        <td></td>
        <td className='text-sm border border-gray-300'>{task.index}</td>
        <td className='text-sm border border-gray-300'>{task.name}</td>
        <td className='text-sm border border-gray-300'>{task.startDate.toLocaleDateString()}</td>
        <td className='text-sm border border-gray-300'>{task.endDate.toLocaleDateString()}</td>
        <td className='text-sm border border-gray-300'>{calculateDuration(task.startDate, task.endDate)} days</td>
        <td className='text-sm border border-gray-300'>{task.actualStart?.toLocaleDateString() || '-'}</td>
        <td className='text-sm border border-gray-300'>{task.actualEnd?.toLocaleDateString() || '-'}</td>
        <td className='text-sm border border-gray-300'>
          {task.actualStart && task.actualEnd 
            ? `${calculateDuration(task.actualStart, task.actualEnd)} days` 
            : '-'}
        </td>
        <td className='text-sm border border-gray-300'>{task.progress}%</td>
        <td className='text-sm border border-gray-300 whitespace-nowrap text-ellipsis overflow-hidden'>{task.clientSpoc}</td>
        <td className='text-sm border border-gray-300 whitespace-nowrap text-ellipsis overflow-hidden'>{task.apSpoc}</td>
        <td className='text-sm border border-gray-300 whitespace-nowrap text-ellipsis overflow-hidden'>{task.projectManager}</td>
        <td className='text-sm border border-gray-300 max-w-[100px] whitespace-nowrap text-ellipsis overflow-hidden'
            onClick={()=>setAssignDialogOpen(true)}
          >

        <EmployeeAvatar assignments={task.assignments} />
        </td>
        <td className='text-sm border border-gray-300'>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            {/* <Button
              variant="outline"
              size="xs"
              onClick={() => setAssignDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
            </Button> */}
            <Button
              variant="destructive"
              size="xs"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>

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

