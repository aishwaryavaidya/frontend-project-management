import { Task } from '@/app/plan2/types/task';
import { adjustDates, calculateEndDate } from './dateUtils';

export function getMaxPredecessorEndDate(tasks: Task[], predecessorIds: string): Date | null {
  const siNos = predecessorIds.split(',').map(Number);
  const predecessors = tasks.filter((t) => siNos.includes(t.siNo));
  const endDates = predecessors.map((t) => t.endDate).filter(Boolean) as Date[];
  return endDates.length ? new Date(Math.max(...endDates.map((d) => d.getTime()))) : null;
}

export function adjustTaskDatesWithPredecessors(task: Partial<Task>, allTasks: Task[]): Partial<Task> {
  if (!task.predecessorIds || !task.startDate) return task;
  const maxPredEndDate = getMaxPredecessorEndDate(allTasks, task.predecessorIds);
  if (maxPredEndDate && (!task.startDate || task.startDate <= maxPredEndDate)) {
    const newStartDate = new Date(maxPredEndDate);
    newStartDate.setDate(newStartDate.getDate() + 1);
    return adjustDates({ ...task, startDate: newStartDate });
  }
  return task;
}

export function syncParentChildDates(tasks: Task[], updatedTask: Task): Task[] {
  const updatedTasks = [...tasks];
  const taskIndex = updatedTasks.findIndex((t) => t.id === updatedTask.id);
  updatedTasks[taskIndex] = updatedTask;

  let parentIdx = taskIndex - 1;
  while (parentIdx >= 0 && updatedTasks[parentIdx].level < updatedTask.level) {
    const parent = updatedTasks[parentIdx];
    const subtasks = updatedTasks.slice(parentIdx + 1).filter((t) => t.level > parent.level);
    const subtaskStartDates = subtasks.map((t) => t.startDate).filter(Boolean) as Date[];
    const subtaskEndDates = subtasks.map((t) => t.endDate).filter(Boolean) as Date[];

    parent.startDate = subtaskStartDates.length
      ? new Date(Math.min(parent.startDate?.getTime() || Infinity, ...subtaskStartDates.map((d) => d.getTime())))
      : parent.startDate;
    parent.endDate = subtaskEndDates.length
      ? new Date(Math.max(parent.endDate?.getTime() || -Infinity, ...subtaskEndDates.map((d) => d.getTime())))
      : parent.endDate;

    updatedTasks[parentIdx] = parent;
    parentIdx--;
  }
  return updatedTasks;
}

export { adjustDates };
