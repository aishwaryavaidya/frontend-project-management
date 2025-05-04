import { Task, TaskUpdate } from '@/app/dashboard/project-plan/types/task';
import { addDays } from 'date-fns';

/**
 * Calculates the maximum end date from all predecessor tasks
 * @param tasks All tasks in the project
 * @param predecessorIds Comma-separated string of predecessor SI numbers
 * @returns The latest end date among all predecessors or null if none found
 */
export function getMaxPredecessorEndDate(tasks: Task[], predecessorIds: string): Date | null {
  if (!predecessorIds?.trim()) return null;
  
  // Parse comma-separated SI numbers into an array of integers, filtering out invalid values
  const siNos = predecessorIds.split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id));
  
  if (siNos.length === 0) return null;
  
  // Filter tasks to get valid predecessors (not deleted and matching SI numbers)
  const predecessors = tasks.filter(t => 
    !t.isDeleted && siNos.includes(t.siNo) && t.endDate
  );
  
  if (predecessors.length === 0) return null;
  
  // Find the maximum end date among all predecessors
  const endDates = predecessors.map(t => t.endDate as Date);
  return new Date(Math.max(...endDates.map(d => d.getTime())));
}

/**
 * Validates task dates for consistency
 * @param task The task to validate
 * @param allTasks All tasks in the project
 * @returns Array of error messages, empty if valid
 */
export function validateTaskDates(task: TaskUpdate, allTasks: Task[]): string[] {
  const errors: string[] = [];
  
  // Check start date is before end date
  if (task.startDate && task.endDate && 
      task.startDate >= task.endDate) {
    errors.push('Start date must be before end date');
  }

  // Check task starts after all predecessors end
  if (task.predecessorIds?.trim() && task.startDate) {
    const maxPredEndDate = getMaxPredecessorEndDate(allTasks, task.predecessorIds);
    if (maxPredEndDate && task.startDate <= maxPredEndDate) {
      errors.push('Start date must be after all predecessor end dates');
    }
  }

  return errors;
}

/**
 * Validates predecessor references
 * @param task The task being validated
 * @param predecessorIds Comma-separated string of predecessor SI numbers
 * @param tasks All tasks in the project
 * @returns Array of error messages, empty if valid
 */
export function validatePredecessors(task: Task, predecessorIds: string, tasks: Task[]): string[] {
  const errors: string[] = [];
  if (!predecessorIds?.trim()) return errors;

  // Parse and validate SI numbers
  const siNos = predecessorIds.split(',')
    .map(id => parseInt(id.trim()))
    .filter(id => !isNaN(id));
  
  // Check if all SI numbers exist
  const invalidSiNos = siNos.filter(siNo => 
    !tasks.find(t => !t.isDeleted && t.siNo === siNo)
  );
  
  if (invalidSiNos.length > 0) {
    errors.push(`Invalid SI numbers: ${invalidSiNos.join(', ')}`);
  }

  // Check for self-reference
  if (siNos.includes(task.siNo)) {
    errors.push('Task cannot depend on itself');
  }

  return errors;
}

/**
 * Update task levels for indentation 
 */
export function updateTaskLevelsForIndent(tasks: Task[], selectedIds: Set<string>): Task[] {
  if (selectedIds.size === 0) return tasks;

  const result = [...tasks];
  const selectedTasks = result.filter(t => selectedIds.has(t.id));
  
  for (const task of selectedTasks) {
    const taskIndex = result.findIndex(t => t.id === task.id);
    if (taskIndex <= 0) continue; // Can't indent the first task
    
    // Find the task directly above
    const aboveTask = result[taskIndex - 1];
    
    // Increase level by 1, but don't exceed the above task's level + 1
    result[taskIndex] = {
      ...task,
      level: Math.min(task.level + 1, aboveTask.level + 1),
      isParent: false // Reset parent status, will be recalculated later
    };
    
    // Update above task to be a parent if needed
    if (!aboveTask.isParent && result[taskIndex].level > aboveTask.level) {
      result[taskIndex - 1] = {
        ...aboveTask,
        isParent: true
      };
    }
  }
  
  return updateWbsNumbers(result);
}

/**
 * Update task levels for outdentation
 */
export function updateTaskLevelsForOutdent(tasks: Task[], selectedIds: Set<string>): Task[] {
  if (selectedIds.size === 0) return tasks;

  const result = [...tasks];
  const selectedTasks = result.filter(t => selectedIds.has(t.id));
  
  for (const task of selectedTasks) {
    // Can't outdent level 0 tasks
    if (task.level === 0) continue;
    
    const taskIndex = result.findIndex(t => t.id === task.id);
    
    // Decrease level by 1
    result[taskIndex] = {
      ...task,
      level: task.level - 1
    };
  }
  
  return updateWbsNumbers(result);
}

/**
 * Updates WBS numbers for all tasks based on their hierarchy
 */
export function updateWbsNumbers(tasks: Task[]): Task[] {
  if (tasks.length === 0) return tasks;
  
  const result = [...tasks];
  const wbsMap = new Map<string, string>();
  
  // Process level 0 tasks first
  result.forEach((task, index) => {
    if (task.level === 0) {
      const wbs = `${task.siNo}`;
      wbsMap.set(task.id, wbs);
      result[index] = { ...task, wbsNo: wbs };
      
      // Process children recursively
      processChildren(result, task, index, wbs, wbsMap);
    }
  });
  
  return result;
}

/**
 * Helper function to process children tasks and update their WBS numbers
 */
function processChildren(
  tasks: Task[], 
  parentTask: Task, 
  parentIndex: number, 
  parentWbs: string,
  wbsMap: Map<string, string>
): void {
  let childCounter = 1;
  
  // Iterate through tasks after the parent
  for (let i = parentIndex + 1; i < tasks.length; i++) {
    const task = tasks[i];
    
    // If we encounter a task with level less than or equal to the parent, we're done with this branch
    if (task.level <= parentTask.level) break;
    
    // If this task is a direct child (level is exactly parent level + 1)
    if (task.level === parentTask.level + 1) {
      const wbs = `${parentWbs}.${childCounter}`;
      wbsMap.set(task.id, wbs);
      tasks[i] = { ...task, wbsNo: wbs };
      childCounter++;
      
      // Process this child's children
      processChildren(tasks, task, i, wbs, wbsMap);
    }
  }
}

/**
 * Calculate schedule percentage based on start and end dates
 */
export function calculateSchedulePercentage(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 0;

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // If the task hasn't started yet
  if (now < start) return 0;
  
  // If the task is already past its end date
  if (now > end) return 100;
  
  // Calculate percentage based on current date between start and end
  const totalDuration = end.getTime() - start.getTime();
  const elapsedDuration = now.getTime() - start.getTime();
  
  if (totalDuration <= 0) return 0;
  
  const percentage = Math.round((elapsedDuration / totalDuration) * 100);
  return Math.min(100, Math.max(0, percentage));
} 