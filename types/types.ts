export type CategoryProps = {
    title: string;
    slug: string;
    imageUrl: string;
    description: string;
  };
  export type UserProps = {
    name: string;
    firstName: string;
    lastName: string;
    phone: string;
    image: string;
    email: string;
    password: string;
  };
  export type LoginProps = {
    email: string;
    password: string;
  };
  
  
  // types.ts
  export interface Employee {
    id: number;
    name: string;
    role: string;
  }
  
  export interface Assignment {
    id: number;
    employeeId: number;
    employeeName: string;
    role: string;
    percentage: number;
  }
  
  // Task related types
  export interface Task {
    id: number;
    index: string;
    name: string;
    startDate: Date;
    endDate: Date;
    actualStart?: Date;
    actualEnd?: Date;
    progress: number;
    clientSpoc: string;
    apSpoc: string;
    projectManager: string;
    assignments: Assignment[];
    isSelected?: boolean;
  }
  
  // Project structure types
  export interface Milestone {
    id: number;
    index: number;
    name: string;
    startDate: Date;
    endDate: Date;
    actualStart?: Date;
    actualEnd?: Date;
    progress: number;
    clientSpoc: string;
    apSpoc: string;
    tasks: Task[];
    isExpanded?: boolean;
  }
  
  export interface Phase {
    id: number;
    name: string;
    milestones: Milestone[];
  }