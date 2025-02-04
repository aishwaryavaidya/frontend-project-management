import React from 'react';
import { Calendar, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: string;
  remarks?: string;
}

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer group">
      <div className="space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 text-sm">
          {task.title}
        </h3>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <User className="w-3 h-3 mr-1" />
          {task.assignee}
        </div>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3 mr-1" />
          <span>{new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}</span>
        </div>
      </div>

      {task.remarks && (
        <div className="absolute invisible group-hover:visible bg-gray-900 text-white p-2 rounded text-xs -mt-2 z-10 max-w-xs">
          {task.remarks}
        </div>
      )}
    </div>
  );
}