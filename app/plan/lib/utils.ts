import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Task, Predecessor } from './types';
import { addDays, isAfter, max, isBefore } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateEndDate(startDate: Date, duration: number): Date {
  return addDays(startDate, duration);
}

export function getMaxEndDateOfSubtasks(task: Task, tasks: Task[]): Date {
  const subtasks = tasks.filter(t => 
    t.outlineLevel > task.outlineLevel && 
    t.wbs.startsWith(task.wbs)
  );

  if (subtasks.length === 0) {
    return calculateEndDate(task.startDate, task.duration);
  }

  const maxSubtaskEndDate = max(subtasks.map(t => t.endDate));
  return max([maxSubtaskEndDate, calculateEndDate(task.startDate, task.duration)]);
}

export function getMinStartDateFromPredecessors(task: Task, tasks: Task[]): Date {
  if (!task.predecessors.length) return task.startDate;

  const predecessorEndDates = task.predecessors.map(pred => {
    const predTask = tasks.find(t => t.id === pred.taskId);
    return predTask ? predTask.endDate : new Date();
  });

  return max(predecessorEndDates);
}

export function updateTaskDates(task: Task, allTasks: Task[]): Task {
  // Get minimum start date based on predecessors
  const minStartDate = getMinStartDateFromPredecessors(task, allTasks);
  let newStartDate = task.startDate;
  
  if (isBefore(task.startDate, minStartDate)) {
    newStartDate = minStartDate;
  }

  // Calculate end date considering subtasks
  const endDateFromDuration = calculateEndDate(newStartDate, task.duration);
  const maxSubtaskEndDate = getMaxEndDateOfSubtasks(task, allTasks);
  const newEndDate = max([endDateFromDuration, maxSubtaskEndDate]);

  return {
    ...task,
    startDate: newStartDate,
    endDate: newEndDate
  };
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
  
  function updateWBS(task: Task, index: number): void {
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

export function findDependentTasks(taskIds: string[], tasks: Task[]): Array<{
  task: Task;
  dependencies: Array<{ taskId: string; siNo: number }>;
}> {
  return tasks
    .filter(task => 
      task.predecessors.some(pred => taskIds.includes(pred.taskId))
    )
    .map(task => ({
      task,
      dependencies: task.predecessors
        .filter(pred => taskIds.includes(pred.taskId))
        .map(pred => ({
          taskId: pred.taskId,
          siNo: pred.siNo
        }))
    }));
}

export function isTaskDelayed(task: Task): boolean {
  if (task.actualEndDate) {
    return isAfter(task.actualEndDate, task.endDate);
  }
  return isAfter(new Date(), task.endDate) && task.progress < 100;
}