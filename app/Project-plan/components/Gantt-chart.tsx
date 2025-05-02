"use client";

import { useEffect, useRef } from 'react';
import { Task } from '../_lib/types';
import { addDays, differenceInDays, format, isAfter, isBefore, startOfDay } from 'date-fns';

interface GanttChartProps {
  tasks: Task[];
  selectedTaskId: string | null;
  onTaskSelect: (taskId: string) => void;
}

export function GanttChart({ tasks, selectedTaskId, onTaskSelect }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getProjectDateRange = () => {
    if (!tasks.length) return { start: new Date(), end: addDays(new Date(), 30) };

    const start = tasks.reduce((earliest, task) => 
      isBefore(task.startDate, earliest) ? task.startDate : earliest,
      tasks[0].startDate
    );

    const end = tasks.reduce((latest, task) => 
      isAfter(task.endDate, latest) ? task.endDate : latest,
      tasks[0].endDate
    );

    return {
      start: startOfDay(start),
      end: startOfDay(addDays(end, 7)) // Add padding
    };
  };

  const dateRange = getProjectDateRange();
  const totalDays = differenceInDays(dateRange.end, dateRange.start) + 1;
  const dayWidth = 30; // pixels per day
  const chartWidth = totalDays * dayWidth;
  const rowHeight = 40;

  const renderTimeScale = () => {
    const days = Array.from({ length: totalDays }, (_, i) => addDays(dateRange.start, i));
    
    return (
      <div className="flex border-b border-gray-200" style={{ marginLeft: '200px' }}>
        {days.map((date, index) => (
          <div
            key={index}
            className="flex-shrink-0 border-r border-gray-200 text-xs text-gray-500 px-2"
            style={{ width: `${dayWidth}px` }}
          >
            {format(date, 'MMM d')}
          </div>
        ))}
      </div>
    );
  };

  const renderTaskBar = (task: Task, index: number) => {
    const startOffset = differenceInDays(task.startDate, dateRange.start);
    const duration = differenceInDays(task.endDate, task.startDate) + 1;
    const leftPosition = startOffset * dayWidth;
    const width = duration * dayWidth;

    return (
      <div
        key={task.id}
        className="relative"
        style={{ height: `${rowHeight}px` }}
      >
        <div 
          className={`absolute h-8 rounded flex items-center ${
            selectedTaskId === task.id ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{
            left: `${leftPosition}px`,
            width: `${width}px`,
            top: '4px',
            marginLeft: '200px'
          }}
          onClick={() => onTaskSelect(task.id)}
        >
          {task.isMilestone ? (
            <div className="w-4 h-4 bg-blue-600 rotate-45 transform origin-center" />
          ) : (
            <div 
              className="h-full w-full bg-blue-500 rounded relative overflow-hidden"
              style={{ backgroundColor: 'rgb(59, 130, 246)' }}
            >
              <div
                className="h-full bg-blue-700"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Draw dependency arrows */}
        {task.predecessors.map(pred => {
          const predecessor = tasks.find(t => t.id === pred.taskId);
          if (!predecessor) return null;

          const predEndOffset = differenceInDays(predecessor.endDate, dateRange.start) * dayWidth;
          const taskStartOffset = leftPosition;
          const lineStartX = predEndOffset + 200;
          const lineEndX = taskStartOffset + 200;
          const lineY = index * rowHeight + rowHeight / 2;
          const predIndex = tasks.findIndex(t => t.id === pred.taskId);
          const predY = predIndex * rowHeight + rowHeight / 2;

          return (
            <svg
              key={`${task.id}-${pred.taskId}`}
              className="absolute top-0 left-0 pointer-events-none"
              style={{
                width: '100%',
                height: '100%',
                overflow: 'visible'
              }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#4B5563"
                  />
                </marker>
              </defs>
              <path
                d={`M ${lineStartX} ${predY} H ${lineStartX + 10} V ${lineY} H ${lineEndX}`}
                stroke="#9CA3AF"
                strokeWidth="1"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </svg>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="border rounded-lg bg-white overflow-auto"
      style={{ height: '500px' }}
    >
      {renderTimeScale()}
      <div className="relative">
        {tasks.map((task, index) => renderTaskBar(task, index))}
      </div>
    </div>
  );
}