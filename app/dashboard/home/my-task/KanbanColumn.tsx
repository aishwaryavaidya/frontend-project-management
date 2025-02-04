"use client";
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';

interface Task {
  id: string;
  title: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: string;
  remarks?: string;
}

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  gradient: string;
}

export function KanbanColumn({ id, title, tasks, gradient }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gradient-to-br ${gradient} rounded-lg p-4 shadow-lg transition-transform duration-200 hover:scale-[1.02] flex flex-col h-full`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <span className="bg-white/30 dark:bg-white/10 px-2 py-1 rounded-full text-sm">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 overflow-y-auto flex-grow">
          {tasks.map(task => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}