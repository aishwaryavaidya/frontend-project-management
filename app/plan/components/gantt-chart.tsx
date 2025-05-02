"use client";

import { useEffect, useRef } from 'react';
import { Task } from '../lib/types';
import { addDays, differenceInDays, format, isAfter, isBefore, startOfDay } from 'date-fns';
import { isTaskDelayed } from '../lib/utils';

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
    const isDelayed = isTaskDelayed(task);

    const renderMilestone = () => (
      <div 
        className="absolute transform -translate-y-1/2"
        style={{ left: `${leftPosition + width}px`, top: '50%' }}
      >
        <div className="w-6 h-6 bg-blue-600 rotate-45 transform origin-center flex items-center justify-center">
          <div className="w-4 h-4 bg-white rotate-45 transform origin-center" />
        </div>
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs">
          <div className="font-medium">{task.name}</div>
          <div className="text-gray-500">
            Plan: {format(task.endDate, 'MMM d')}
            {task.actualEndDate && (
              <>
                <br />
                Actual: {format(task.actualEndDate, 'MMM d')}
              </>
            )}
          </div>
        </div>
      </div>
    );

    const renderTaskProgress = () => (
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
        <div 
          className={`h-full w-full rounded relative overflow-hidden ${
            isDelayed ? 'bg-red-100' : 'bg-gray-100'
          }`}
        >
          {/* Actual progress bar */}
          {task.actualStartDate && (
            <div
              className={`h-full absolute ${isDelayed ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{
                left: `${differenceInDays(task.actualStartDate, task.startDate) * (100 / duration)}%`,
                width: `${task.progress}%`
              }}
            />
          )}
          {/* Planned bar overlay */}
          <div
            className="h-full absolute border-2 border-gray-400 rounded"
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );

    return (
      <div
        key={task.id}
        className="relative"
        style={{ height: `${rowHeight}px` }}
      >
        {task.isMilestone ? renderMilestone() : renderTaskProgress()}

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