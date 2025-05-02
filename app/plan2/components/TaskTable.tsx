'use client';

import { useState } from 'react';
import { Task } from '@/app/plan2/types/task';
import { updateTask, promoteTask, demoteTask, markAsMilestone } from '@/app/plan2/services/taskService';
import { adjustDates } from '@/app/plan2/lib/dateUtils';

interface TaskRowProps {
  task: Task;
  isSelecting: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onAddBelow: (siNo: number) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
}

export default function TaskRow({ task, isSelecting, isSelected, onSelect, onAddBelow, onDelete, onUpdate }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(task.taskName);

  const handleBlur = async () => {
    setIsEditing(false);
    const updatedTask = await updateTask(task.id, { taskName });
    onUpdate(updatedTask);
  };

  const handlePromote = async () => {
    const updatedTask = await promoteTask(task.id);
    onUpdate(updatedTask);
  };

  const handleDemote = async () => {
    const updatedTask = await demoteTask(task.id);
    onUpdate(updatedTask);
  };

  const handleMilestone = async () => {
    const updatedTask = await markAsMilestone(task.id);
    onUpdate(updatedTask);
  };

  return (
    <tr style={{ paddingLeft: `${task.level * 20}px` }}>
      {isSelecting && <td><input type="checkbox" checked={isSelected} onChange={onSelect} /></td>}
      <td>{task.siNo}</td>
      <td>{task.wbsNo}</td>
      <td onDoubleClick={() => setIsEditing(true)}>
        {task.isMilestone && <span>◆ </span>}
        {isEditing ? (
          <input
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onBlur={handleBlur}
          />
        ) : (
          task.taskName
        )}
      </td>
      <td>{task.predecessorIds || 'NA'}</td>
      <td>{task.duration}</td>
      <td>{task.startDate?.toDateString()}</td>
      <td>{task.endDate?.toDateString()}</td>
      <td>
        <button onClick={() => onAddBelow(task.siNo)}>Add Below</button>
        <button onClick={handlePromote}>Promote</button>
        <button onClick={handleDemote}>Demote</button>
        <button onClick={handleMilestone}>Milestone</button>
        <button onClick={() => onDelete(task.id)}>Delete</button>
      </td>
    </tr>
  );
}