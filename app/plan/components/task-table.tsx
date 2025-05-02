"use client";

import { useState } from 'react';
import { Task } from '../lib/types';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Diamond, BarChart2 } from 'lucide-react';
import { ProgressDialog } from '../components/progress-dialog';
import { Button } from '@/components/ui/button';

interface TaskTableProps {
  tasks: Task[];
  selectedTaskIds: string[];
  onTaskSelect: (taskId: string) => void;
  onTaskSelectMultiple: (taskIds: string[]) => void;
  onTaskNameEdit: (taskId: string, newName: string) => void;
  onPredecessorEdit: (taskId: string, predecessorStr: string) => void;
  onProgressUpdate: (taskId: string, progress: number, actualStartDate?: Date, actualEndDate?: Date) => void;
}

export function TaskTable({
  tasks,
  selectedTaskIds,
  onTaskSelect,
  onTaskSelectMultiple,
  onTaskNameEdit,
  onPredecessorEdit,
  onProgressUpdate,
}: TaskTableProps) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingPredecessorId, setEditingPredecessorId] = useState<string | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onTaskSelectMultiple(tasks.map(task => task.id));
    } else {
      onTaskSelectMultiple([]);
    }
  };

  const renderTask = (task: Task, index: number) => {
    const paddingLeft = task.outlineLevel * 24;
    
    return (
      <div key={task.id}>
        <div 
          className={`flex items-center p-2 hover:bg-gray-100 ${
            selectedTaskIds.includes(task.id) ? 'bg-blue-50' : ''
          }`}
          onClick={() => onTaskSelect(task.id)}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          <Checkbox
            checked={selectedTaskIds.includes(task.id)}
            onCheckedChange={(checked) => {
              if (checked) {
                onTaskSelectMultiple([...selectedTaskIds, task.id]);
              } else {
                onTaskSelectMultiple(selectedTaskIds.filter(id => id !== task.id));
              }
            }}
            className="mr-2"
          />
          
          <div className="grid grid-cols-12 gap-4 flex-1 items-center">
            <div className="col-span-4 flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-8">{index + 1}</span>
              <span className="text-sm text-gray-500 w-16">{task.wbs}</span>
              {task.isMilestone && (
                <Diamond className="w-4 h-4 text-blue-500 mr-1" />
              )}
              {editingTaskId === task.id ? (
                <Input
                  value={task.name}
                  onChange={(e) => onTaskNameEdit(task.id, e.target.value)}
                  onBlur={() => setEditingTaskId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onTaskNameEdit(task.id, (e.target as HTMLInputElement).value);
                      setEditingTaskId(null);
                    }
                  }}
                  autoFocus
                  className="h-8"
                />
              ) : (
                <span
                  onDoubleClick={() => setEditingTaskId(task.id)}
                  className="flex-1 cursor-text"
                >
                  {task.name}
                </span>
              )}
            </div>
            <div className="col-span-2">
              {editingPredecessorId === task.id ? (
                <Input
                  value={task.predecessors.map(p => p.siNo).join(', ')}
                  onChange={(e) => onPredecessorEdit(task.id, e.target.value)}
                  onBlur={() => setEditingPredecessorId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onPredecessorEdit(task.id, (e.target as HTMLInputElement).value);
                      setEditingPredecessorId(null);
                    }
                  }}
                  placeholder="e.g., 1,2,3"
                  className="h-8"
                />
              ) : (
                <span
                  onDoubleClick={() => setEditingPredecessorId(task.id)}
                  className="text-sm text-gray-500 cursor-text"
                >
                  {task.predecessors.map(p => p.siNo).join(', ')}
                </span>
              )}
            </div>
            <span className="col-span-1 text-sm text-gray-500">
              {task.duration} {task.duration === 1 ? 'day' : 'days'}
            </span>
            <span className="col-span-1 text-sm text-gray-500">
              {format(task.startDate, 'MMM d, yyyy')}
            </span>
            <span className="col-span-1 text-sm text-gray-500">
              {format(task.endDate, 'MMM d, yyyy')}
            </span>
            <span className="col-span-1 text-sm text-gray-500">
              {task.actualStartDate ? format(task.actualStartDate, 'MMM d, yyyy') : '-'}
            </span>
            <span className="col-span-1 text-sm text-gray-500">
              {task.actualEndDate ? format(task.actualEndDate, 'MMM d, yyyy') : '-'}
            </span>
            <div className="col-span-1 flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    task.progress === 100
                      ? 'bg-green-500'
                      : task.actualEndDate && task.actualEndDate > task.endDate
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-12">{task.progress}%</span>
              <ProgressDialog
                task={task}
                onUpdate={onProgressUpdate}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <BarChart2 className="h-4 w-4" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-4 py-3 grid grid-cols-12 gap-4 items-center font-medium text-sm text-gray-500">
        <div className="col-span-4 flex items-center space-x-2">
          <Checkbox
            checked={selectedTaskIds.length === tasks.length}
            onCheckedChange={handleSelectAll}
            className="mr-2"
          />
          <span className="w-8">SI No</span>
          <span className="w-16">WBS</span>
          <span>Task Name</span>
        </div>
        <div className="col-span-2">Predecessors</div>
        <div className="col-span-1">Duration</div>
        <div className="col-span-1">Start Date</div>
        <div className="col-span-1">End Date</div>
        <div className="col-span-1">Actual Start</div>
        <div className="col-span-1">Actual End</div>
        <div className="col-span-1">Progress</div>
      </div>
      <div className="divide-y divide-gray-200">
        {tasks.map((task, index) => renderTask(task, index))}
      </div>
    </div>
  );
}