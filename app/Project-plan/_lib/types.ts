export interface Task {
    id: string;
    sino: number;
    module: Module[];
    wbs: string;
    name: string;
    duration: number; // in days
    startDate: Date;
    endDate: Date;
    predecessors: Predecessor[]; // Array of predecessor relationships
    isMilestone: boolean;
    isFinancialMilestone: boolean;
    isSelected?: boolean;
    outlineLevel: number;
    progress: number;
    expanded: boolean;
    subtasks?: Task[];
  }

  export interface Module {
    id: number;
    modulename: string;
  }
  
  export interface Predecessor {
    taskId: string;
    type: 'FS'; // Finish-to-Start (can add more types later like SS, FF, SF)
    siNo: number;
  }
  
  export interface TaskFormData {
    name: string;
    duration: number;
    startDate: Date;
    predecessors: Predecessor[];
    isMilestone: boolean;
    isFinancialMilestone: boolean;
  }
  
  export type ValidationError = {
    [key in keyof TaskFormData]?: string;
  };