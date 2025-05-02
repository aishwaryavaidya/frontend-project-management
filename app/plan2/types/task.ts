export interface Task {
  id: string;
  siNo: number;
  wbsNo: string;
  taskName: string;
  predecessorIds?: string | null;
  duration?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  actualDuration?: number | null;
  level: number;
  isMilestone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskUpdate = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;