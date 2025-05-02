export interface Task {
    id: string;
    wbs: string;
    name: string;
    duration: number;
    startDate: Date;
    endDate: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    predecessors: Predecessor[];
    isMilestone: boolean;
    outlineLevel: number;
    progress: number;
    expanded: boolean;
    subtasks?: Task[];
  }
  
  export interface Predecessor {
    taskId: string;
    type: 'FS';
    siNo: number;
  }
  
  export interface TaskFormData {
    name: string;
    duration: number;
    startDate: Date;
    actualStartDate?: Date;
    actualEndDate?: Date;
    predecessors: Predecessor[];
    isMilestone: boolean;
  }
  
  export type ValidationError = {
    [key in keyof TaskFormData]?: string;
  };
  
  export interface DeleteTaskModalProps {
    tasks: Task[];
    tasksToDelete: string[];
    dependentTasks: Array<{
      task: Task;
      dependencies: Array<{
        taskId: string;
        siNo: number;
      }>;
    }>;
    onClose: () => void;
    onConfirm: () => void;
    onUpdateDependency: (taskId: string, newPredecessors: Predecessor[]) => void;
  }