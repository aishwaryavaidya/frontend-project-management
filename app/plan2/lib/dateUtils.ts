import { Task } from '@/app/plan2/types/task';

export function calculateEndDate(startDate: Date, duration: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);
  return endDate;
}

export function calculateDuration(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function adjustDates(task: Partial<Task>): Partial<Task> {
  const updatedTask = { ...task };
  if (updatedTask.startDate && updatedTask.duration && !updatedTask.endDate) {
    updatedTask.endDate = calculateEndDate(updatedTask.startDate, updatedTask.duration);
  } else if (updatedTask.startDate && updatedTask.endDate && !updatedTask.duration) {
    updatedTask.duration = calculateDuration(updatedTask.startDate, updatedTask.endDate);
  }
  if (updatedTask.actualStartDate && updatedTask.actualDuration && !updatedTask.actualEndDate) {
    updatedTask.actualEndDate = calculateEndDate(updatedTask.actualStartDate, updatedTask.actualDuration);
  } else if (updatedTask.actualStartDate && updatedTask.actualEndDate && !updatedTask.actualDuration) {
    updatedTask.actualDuration = calculateDuration(updatedTask.actualStartDate, updatedTask.actualEndDate);
  }
  return updatedTask;
}