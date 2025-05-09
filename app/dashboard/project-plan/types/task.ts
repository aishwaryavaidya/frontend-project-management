export interface Remark {
  id: string;
  content: string;
  date: Date;
  author: string;
  responseText?: string | null;
  responseAuthor?: string | null;
  responseTimestamp?: Date | null;
}

export interface Stage {
  id: string;
  name: string;
  colorCode: string;
}

export interface Product {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  siNo: number;
  wbsNo: string;
  taskName: string;
  predecessorIds: string | null;
  level: number;
  goLive: boolean;
  financialMilestone: boolean;
  startDate: Date | null;
  endDate: Date | null;
  duration: number | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  actualDuration: number | null;
  progress: number;
  view: string;
  stageId?: string;
  productId?: string;
  stage?: string;
  product?: string;
  isParent?: boolean;
  isDeleted?: boolean;
  remarks: Remark[];
  createdAt: Date;
  updatedAt: Date;
  isMilestone?: boolean;
  isFinancialMilestone?: boolean;
  dependencies?: Task[];
}

export type TaskUpdate = Partial<Task>;

export interface Template {
  id: string;
  name: string;
  tasks: Task[];
  createdAt: Date;
}

// Predefined stages
export const STAGES: Stage[] = [
  { id: 'design', name: 'Design', colorCode: '#4287f5' },
  { id: 'development', name: 'Development', colorCode: '#42f59e' },
  { id: 'testing', name: 'Testing', colorCode: '#f5a442' },
  { id: 'deployment', name: 'Deployment', colorCode: '#f54242' },
  { id: 'maintenance', name: 'Maintenance', colorCode: '#8442f5' }
];

// Predefined products
export const PRODUCTS: Product[] = [
  { id: 'enroute', name: 'Enroute' },
  { id: 'inplant-ib', name: 'Inplant-IB' },
  { id: 'inplant-ob', name: 'Inplant-OB' },
  { id: 'vc', name: 'VC' },
  { id: 'epod', name: 'EpoD' }
];

export const STAGE_OPTIONS = STAGES.map(stage => stage.name);
export const PRODUCT_OPTIONS = PRODUCTS.map(product => product.name); 