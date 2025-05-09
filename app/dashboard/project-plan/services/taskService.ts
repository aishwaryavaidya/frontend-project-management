import { Task } from '../types/task';

// Calculate the schedule percentage based on current date vs planned start and end dates
export function calculateSchedulePercentage(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const current = Date.now();

  // If not started yet
  if (current < start) return 0;

  // If already past end date
  if (current > end) return 100;

  // Calculate percentage
  const totalDuration = end - start;
  const elapsedDuration = current - start;
  return Math.round((elapsedDuration / totalDuration) * 100);
}

// Get dependent tasks
export async function getDependents(taskId: string): Promise<Task[]> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/dependents`);
    if (!response.ok) {
      throw new Error('Failed to fetch dependent tasks');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dependents:', error);
    return [];
  }
}

// Update a task
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Add a task
export async function addTask(projectId: string, task: Partial<Task>): Promise<Task> {
  try {
    const response = await fetch(`/api/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error('Failed to add task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// Promote task (decrease indentation level)
export async function promoteTask(taskId: string): Promise<Task> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/promote`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to promote task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error promoting task:', error);
    throw error;
  }
}

// Demote task (increase indentation level)
export async function demoteTask(taskId: string): Promise<Task> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/demote`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to demote task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error demoting task:', error);
    throw error;
  }
}

// Mark as milestone
export async function markAsMilestone(taskId: string): Promise<Task> {
  try {
    const response = await fetch(`/api/tasks/${taskId}/milestone`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark task as milestone');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking task as milestone:', error);
    throw error;
  }
}

// Calculate task dates based on predecessors and durations
export function calculateTaskDates(task: Task, allTasks: Task[]): { startDate: Date; endDate: Date } {
  // Default to current date if no predecessor or start date
  let startDate = task.startDate ? new Date(task.startDate) : new Date();

  // If there are predecessors, find the latest end date
  if (task.predecessorIds) {
    const predecessorIds = task.predecessorIds.split(',').map(id => id.trim());
    
    // Find all predecessor tasks
    const predecessorTasks = allTasks.filter(t => predecessorIds.includes(String(t.siNo)));
    
    if (predecessorTasks.length > 0) {
      // Find the latest end date among predecessors
      const latestEndDate = new Date(Math.max(...predecessorTasks
        .filter(t => t.endDate)
        .map(t => new Date(t.endDate!).getTime())));
      
      if (!isNaN(latestEndDate.getTime())) {
        // Set start date to day after the latest predecessor end date
        startDate = new Date(latestEndDate);
        startDate.setDate(startDate.getDate() + 1);
      }
    }
  }
  
  // Calculate end date based on duration
  const endDate = new Date(startDate);
  if (task.duration) {
    endDate.setDate(endDate.getDate() + (task.duration - 1)); // -1 because duration includes the start day
  }
  
  return { startDate, endDate };
} 