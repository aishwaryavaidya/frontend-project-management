import { addDays, differenceInDays } from 'date-fns';
import { Task } from '@/app/dashboard/project-plan/types/task';

/**
 * Calculate end date based on start date and duration
 * For duration = 1, end date = start date (same day)
 * For duration > 1, end date = start date + (duration - 1) days
 */
export function calculateEndDate(startDate: Date, duration: number): Date {
  // For 1-day tasks, end date is the same as start date
  if (duration === 1) return new Date(startDate);
  
  // For regular calendar days
  return addDays(startDate, duration - 1);
}

/**
 * Calculate duration between two dates
 * If start and end are the same day, duration = 1
 */
export function calculateDuration(startDate: Date, endDate: Date): number {
  // If same day, duration is 1
  if (startDate.getFullYear() === endDate.getFullYear() && 
      startDate.getMonth() === endDate.getMonth() && 
      startDate.getDate() === endDate.getDate()) {
    return 1;
  }
  
  // Calculate total days
  return differenceInDays(endDate, startDate) + 1;
}

/**
 * Adjusts task dates based on dependencies
 */
export function adjustDates(task: Partial<Task>): Partial<Task> {
  const updatedTask = { ...task };

  // Planned dates
  if (updatedTask.startDate) {
    if (updatedTask.duration && !updatedTask.endDate) {
      updatedTask.endDate = calculateEndDate(updatedTask.startDate, updatedTask.duration);
    } else if (updatedTask.endDate && !updatedTask.duration) {
      updatedTask.duration = calculateDuration(updatedTask.startDate, updatedTask.endDate);
    } else if (updatedTask.duration && updatedTask.endDate) {
      // If all three exist, prioritize duration and recalculate end date
      updatedTask.endDate = calculateEndDate(updatedTask.startDate, updatedTask.duration);
    }
  }

  // Actual dates
  if (updatedTask.actualStartDate) {
    if (updatedTask.actualDuration && !updatedTask.actualEndDate) {
      updatedTask.actualEndDate = calculateEndDate(updatedTask.actualStartDate, updatedTask.actualDuration);
    } else if (updatedTask.actualEndDate && !updatedTask.actualDuration) {
      updatedTask.actualDuration = calculateDuration(updatedTask.actualStartDate, updatedTask.actualEndDate);
    } else if (updatedTask.actualDuration && updatedTask.actualEndDate) {
      updatedTask.actualDuration = calculateDuration(updatedTask.actualStartDate, updatedTask.actualEndDate);
    }
  }

  return updatedTask;
}

/**
 * Validates date constraints for a task
 */
export function validateDateConstraints(task: Task, field: string, date: Date): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight for consistent date-only comparison

  switch (field) {
    case 'startDate':
      if (task.endDate && date > task.endDate) return 'Start date must be before or equal to end date';
      break;
    case 'endDate':
      if (task.startDate && date < task.startDate) return 'End date must be after or equal to start date';
      break;
    case 'actualStartDate':
      if (date > today) return 'Actual start date cannot be in the future';
      if (task.actualEndDate && date > task.actualEndDate) return 'Actual start date must be before or equal to actual end date';
      break;
    case 'actualEndDate':
      if (date > today) return 'Actual end date cannot be in the future';
      if (task.actualStartDate && date < task.actualStartDate) return 'Actual end date must be after or equal to actual start date';
      break;
  }
  return null;
} 