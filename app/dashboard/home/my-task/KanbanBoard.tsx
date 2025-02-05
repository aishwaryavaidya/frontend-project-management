"use client"
import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  assignee: string;
  startDate: string;
  endDate: string;
  status: string;
  remarks?: string;
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Implement Authentication',
    assignee: 'John Doe',
    startDate: '2024-03-10',
    endDate: '2024-03-15',
    status: 'Yet to start',
    remarks: 'Use JWT tokens and implement refresh token mechanism'
  },
  {
    id: '2',
    title: 'Design Dashboard UI',
    assignee: 'Jane Smith',
    startDate: '2024-03-12',
    endDate: '2024-03-18',
    status: 'In Progress',
    remarks: 'Follow the new design system guidelines'
  },
  {
    id: '3',
    title: 'API Integration',
    assignee: 'Mike Johnson',
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    status: 'Yet to start',
    remarks: 'Integrate with payment gateway API'
  },
  {
    id: '4',
    title: 'Database Optimization',
    assignee: 'Sarah Wilson',
    startDate: '2024-03-11',
    endDate: '2024-03-16',
    status: 'In Review',
    remarks: 'Optimize database queries for better performance'
  },
  {
    id: '5',
    title: 'User Testing',
    assignee: 'Emily Brown',
    startDate: '2024-03-08',
    endDate: '2024-03-14',
    status: 'Completed',
    remarks: 'Conduct user testing sessions'
  },
  {
    id: '6',
    title: 'Security Audit',
    assignee: 'David Lee',
    startDate: '2024-03-13',
    endDate: '2024-03-19',
    status: 'In Progress',
    remarks: 'Perform security vulnerability assessment'
  },
  {
    id: '7',
    title: 'Mobile Responsiveness',
    assignee: 'Lisa Chen',
    startDate: '2024-03-14',
    endDate: '2024-03-17',
    status: 'Yet to start',
    remarks: 'Ensure responsive design for mobile devices'
  },
  {
    id: '8',
    title: 'Documentation',
    assignee: 'Tom Wilson',
    startDate: '2024-03-09',
    endDate: '2024-03-13',
    status: 'Completed',
    remarks: 'Update API documentation'
  },
  {
    id: '9',
    title: 'Performance Testing',
    assignee: 'Alex Martinez',
    startDate: '2024-03-16',
    endDate: '2024-03-21',
    status: 'Yet to start',
    remarks: 'Conduct load and stress testing'
  },
  {
    id: '10',
    title: 'Bug Fixes',
    assignee: 'Rachel Kim',
    startDate: '2024-03-12',
    endDate: '2024-03-15',
    status: 'In Review',
    remarks: 'Fix reported bugs in production'
  },
  {
    id: '11',
    title: 'Feature Implementation',
    assignee: 'Chris Taylor',
    startDate: '2024-03-15',
    endDate: '2024-03-20',
    status: 'In Progress',
    remarks: 'Implement new user dashboard features'
  },
  {
    id: '12',
    title: 'Code Review',
    assignee: 'Mark Anderson',
    startDate: '2024-03-13',
    endDate: '2024-03-16',
    status: 'In Review',
    remarks: 'Review pull requests'
  },
  {
    id: '13',
    title: 'UI/UX Improvements',
    assignee: 'Sophie Garcia',
    startDate: '2024-03-14',
    endDate: '2024-03-18',
    status: 'Yet to start',
    remarks: 'Enhance user interface based on feedback'
  },
  {
    id: '14',
    title: 'Deployment',
    assignee: 'James Wilson',
    startDate: '2024-03-10',
    endDate: '2024-03-14',
    status: 'Completed',
    remarks: 'Deploy application to production'
  },
  {
    id: '15',
    title: 'Analytics Integration',
    assignee: 'Emma Davis',
    startDate: '2024-03-15',
    endDate: '2024-03-19',
    status: 'In Progress',
    remarks: 'Integrate Google Analytics'
  }
];

const columns = [
  {
    id: 'yet-to-start',
    title: 'Yet to start',
    gradient: 'from-[#FFB6B9] to-[#FFD6DA] dark:from-[#FFB6B9]/30 dark:to-[#FFD6DA]/30'
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    gradient: 'from-[#B2DFDB] to-[#A7D8F0] dark:from-[#B2DFDB]/30 dark:to-[#A7D8F0]/30'
  },
  {
    id: 'in-review',
    title: 'In Review',
    gradient: 'from-[#C3A2E8] to-[#E3D4F1] dark:from-[#C3A2E8]/30 dark:to-[#E3D4F1]/30'
  },
  {
    id: 'completed',
    title: 'Completed',
    gradient: 'from-[#A3D9A5] to-[#D9F2C7] dark:from-[#A3D9A5]/30 dark:to-[#D9F2C7]/30'
  }
  
];

export function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = columns.find(col => col.id === over.id);

    if (activeTask && overColumn && activeTask.status !== overColumn.title) {
      setTasks(tasks.map(task => {
        if (task.id === activeTask.id) {
          toast.success(`Task "${task.title}" moved from ${task.status} to ${overColumn.title}`);
          return { ...task, status: overColumn.title };
        }
        return task;
      }));
    }

    setActiveTask(null);
  };

  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center text-4xl">
        My Tasks
      </h1>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {columns.map(column => {
            const columnTasks = tasks.filter(task => task.status === column.title);
            
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={columnTasks}
                gradient={column.gradient}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}