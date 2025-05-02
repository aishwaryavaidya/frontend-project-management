import { prisma } from '@/prisma/db';
import { Task } from '@/app/plan2/types/task';
import { adjustDates, adjustTaskDatesWithPredecessors } from '@/app/plan2/lib/taskUtils';

export async function addTask(tasks: Task[]): Promise<Task> {
  const lastTask = tasks[tasks.length - 1];
  const newSiNo = lastTask ? lastTask.siNo + 1 : 1;
  const predecessorIds = lastTask ? String(lastTask.siNo) : null;

  const taskData = adjustTaskDatesWithPredecessors(
    adjustDates({
      siNo: newSiNo,
      wbsNo: String(newSiNo),
      taskName: '<task1>',
      predecessorIds,
      startDate: new Date(),
    }),
    tasks
  );

  return prisma.task.create({ data: taskData });
}

export async function addTaskBelow(siNo: number): Promise<Task> {
  const tasks = await prisma.task.findMany({ orderBy: { siNo: 'asc' } });
  const newSiNo = siNo + 1;
  await prisma.task.updateMany({
    where: { siNo: { gte: newSiNo } },
    data: { siNo: { increment: 1 }, wbsNo: { set: prisma.task.siNo.toString() } },
  });

  const taskData = adjustTaskDatesWithPredecessors(
    adjustDates({
      siNo: newSiNo,
      wbsNo: String(newSiNo),
      taskName: '<task1>',
      predecessorIds: String(siNo),
      startDate: new Date(),
    }),
    tasks
  );

  return prisma.task.create({ data: taskData });
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  return prisma.task.update({ where: { id }, data });
}

export async function deleteTask(id: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return;

  await prisma.task.delete({ where: { id } });
  await prisma.task.updateMany({
    where: { siNo: { gt: task.siNo } },
    data: { siNo: { decrement: 1 }, wbsNo: { set: prisma.task.siNo.toString() } },
  });
}

export async function getDependents(taskId: string): Promise<Task[]> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return [];
  return prisma.task.findMany({
    where: { predecessorIds: { contains: String(task.siNo) } },
  });
}

export async function promoteTask(id: string): Promise<Task> {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) throw new Error('Task not found');
  const newLevel = task.level + 1;
  const parentWbs = task.wbsNo.split('.').slice(0, -1).join('.') || '0';
  const newWbs = `${parentWbs}.${task.siNo}`;
  return prisma.task.update({
    where: { id },
    data: { level: newLevel, wbsNo: newWbs },
  });
}

export async function demoteTask(id: string): Promise<Task> {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task || task.level === 0) throw new Error('Cannot demote further');
  const newLevel = task.level - 1;
  const newWbs = task.wbsNo.split('.').slice(0, -1).join('.') || String(task.siNo);
  return prisma.task.update({
    where: { id },
    data: { level: newLevel, wbsNo: newWbs },
  });
}

export async function markAsMilestone(id: string): Promise<Task> {
  return prisma.task.update({
    where: { id },
    data: { isMilestone: true },
  });
}