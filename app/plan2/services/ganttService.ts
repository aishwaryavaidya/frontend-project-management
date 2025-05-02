// import { Task } from '@/app/plan2/types/task';

// export interface GanttTask {
//   id: string;
//   text: string;
//   start_date: Date;
//   end_date: Date;
//   progress: number;
//   parent: string | null;
//   type: 'task' | 'milestone';
//   planned_start: Date | null;
//   planned_end: Date | null;
//   actual_start: Date | null;
//   actual_end: Date | null;
// }

// export interface GanttLink {
//   id: string;
//   source: string;
//   target: string;
//   type: string;
// }

// export class GanttService {
//   static convertToGanttTask(task: Task): GanttTask {
//     return {
//       id: task.id,
//       text: task.taskName,
//       start_date: task.startDate || new Date(),
//       end_date: task.endDate || new Date(),
//       progress: this.calculateProgress(task),
//       parent: null, // Will be set based on hierarchy
//       type: task.isMilestone ? 'milestone' : 'task',
//       planned_start: task.startDate,
//       planned_end: task.endDate,
//       actual_start: task.actualStartDate,
//       actual_end: task.actualEndDate
//     };
//   }

//   static calculateProgress(task: Task): number {
//     if (task.actualEndDate) return 1;
//     if (!task.actualStartDate) return 0;
    
//     const totalDuration = task.duration || 0;
//     if (totalDuration === 0) return 0;

//     const today = new Date();
//     const actualStart = new Date(task.actualStartDate);
//     const elapsed = Math.floor((today.getTime() - actualStart.getTime()) / (1000 * 60 * 60 * 24));
    
//     return Math.min(1, Math.max(0, elapsed / totalDuration));
//   }

//   static createDependencyLinks(tasks: Task[]): GanttLink[] {
//     return tasks
//       .filter(task => task.predecessorIds)
//       .flatMap(task => 
//         task.predecessorIds!.split(',').map(siNo => {
//           const predecessor = tasks.find(t => t.siNo === Number(siNo));
//           return predecessor ? {
//             id: `${predecessor.id}-${task.id}`,
//             source: predecessor.id,
//             target: task.id,
//             type: '0' // Finish-to-Start
//           } : null;
//         })
//       )
//       .filter((link): link is GanttLink => link !== null);
//   }

//   static buildHierarchy(tasks: Task[]): GanttTask[] {
//     const ganttTasks = tasks.map(task => this.convertToGanttTask(task));
    
//     for (let i = 0; i < tasks.length; i++) {
//       if (tasks[i].level > 0) {
//         // Find the nearest parent task
//         for (let j = i - 1; j >= 0; j--) {
//           if (tasks[j].level === tasks[i].level - 1) {
//             ganttTasks[i].parent = tasks[j].id;
//             break;
//           }
//         }
//       }
//     }

//     return ganttTasks;
//   }
// }