import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task, Predecessor } from './types';
import { addDays, isAfter, max } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate end date based on start date and duration
export function calculateEndDate(startDate: Date, duration: number): Date {
  return addDays(startDate, duration - 1); // Subtract 1 as duration includes start date
}

// Get the earliest possible start date based on predecessors
export function getEarliestStartDate(task: Task, allTasks: Task[]): Date {
  if (!task.predecessors.length) return task.startDate;

  const dates = task.predecessors.map(pred => {
    const predTask = allTasks.find(t => t.id === pred.taskId);
    if (!predTask) return task.startDate;

    switch (pred.type) {
      case 'FS': // Finish-to-Start: Task can't start until predecessor finishes
        return addDays(predTask.endDate, 1);
      default:
        return task.startDate;
    }
  });

  return max(dates);
}

export function updateTaskDates(task: Task, allTasks: Task[]): Task {
  if (task.predecessors.length > 0) {
    const predecessorEndDates = task.predecessors.map(pred => {
      const predTask = allTasks.find(t => t.id === pred.taskId);
      return predTask ? predTask.endDate : new Date();
    });

    if (predecessorEndDates.length > 0) {
      const latestEndDate = max(predecessorEndDates);
      
      // If the task's start date is earlier than the latest predecessor end date,
      // update it and recalculate the end date
      if (task.startDate < latestEndDate) {
        return {
          ...task,
          startDate: latestEndDate,
          endDate: calculateEndDate(latestEndDate, task.duration)
        };
      }
    }
  }
  return task;
}

export function hasCyclicDependency(taskId: string, predecessorId: string, tasks: Task[]): boolean {
  const visited = new Set<string>();
  
  function dfs(currentId: string): boolean {
    if (currentId === taskId) return true;
    if (visited.has(currentId)) return false;
    
    visited.add(currentId);
    const task = tasks.find(t => t.id === currentId);
    
    return task?.predecessors.some(pred => dfs(pred.taskId)) || false;
  }
  
  return dfs(predecessorId);
}

export function generateWBS(tasks: Task[]): Task[] {
  let currentNumbers: number[] = [0];
  
  function updateWBS(task: Task, index: number, parentWBS: string = ''): void {
    if (index === 0 || task.outlineLevel === 0) {
      currentNumbers[0]++;
      task.wbs = currentNumbers[0].toString();
    } else {
      const prevTask = tasks[index - 1];
      
      if (task.outlineLevel > prevTask.outlineLevel) {
        currentNumbers[task.outlineLevel] = 1;
        task.wbs = `${prevTask.wbs}.${currentNumbers[task.outlineLevel]}`;
      } else if (task.outlineLevel === prevTask.outlineLevel) {
        currentNumbers[task.outlineLevel]++;
        const parentParts = prevTask.wbs.split('.');
        parentParts.pop();
        task.wbs = `${parentParts.join('.')}.${currentNumbers[task.outlineLevel]}`;
      } else {
        currentNumbers[task.outlineLevel]++;
        const parentParts = prevTask.wbs.split('.');
        parentParts.length = task.outlineLevel + 1;
        task.wbs = `${parentParts.slice(0, -1).join('.')}.${currentNumbers[task.outlineLevel]}`;
      }
    }
  }

  tasks.forEach((task, index) => {
    updateWBS(task, index);
  });

  return tasks;
}

export function getPredecessorDisplay(pred: Predecessor, tasks: Task[]): string {
  const task = tasks.find(t => t.id === pred.taskId);
  if (!task) return '';
  return `${pred.siNo}${pred.type}`;
}