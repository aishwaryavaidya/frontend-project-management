import { Task } from './types';

// In-memory storage
let tasks: Task[] = [];

export const db = {
  tasks: {
    findMany: async () => {
      return tasks;
    },
    create: async (data: Task) => {
      const task = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : undefined,
      };
      tasks.push(task);
      return task;
    },
    update: async (id: string, data: Partial<Task>) => {
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');
      
      tasks[index] = {
        ...tasks[index],
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : tasks[index].startDate,
        endDate: data.endDate ? new Date(data.endDate) : tasks[index].endDate,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : tasks[index].actualStartDate,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : tasks[index].actualEndDate,
      };
      return tasks[index];
    },
    delete: async (id: string) => {
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');
      tasks.splice(index, 1);
    },
    findDependentTasks: async (taskId: string) => {
      return tasks.filter(task => 
        task.predecessors.some(pred => pred.taskId === taskId)
      );
    }
  }
};