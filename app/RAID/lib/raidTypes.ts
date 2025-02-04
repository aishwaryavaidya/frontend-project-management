export type RAIDType = {
    id: string;
    milestoneNo: number;
    dateRaised: Date;
    type: string;
    sprintDate: Date;
    category: "Risk" | "Assumption" | "Dependency";
    probability: number;
    preventiveAction: string;
    status: "open" | "in progress" | "closed";
    impact: string;
    priority: "Extreme" | "High" | "Medium" | "Low";
    confirmedBy: string;
    confirmationDate: Date;
    mitigationPlan: string[];
    owner: string;
    dateClosed?: Date;
    activitiesLog: { activity: string; date: Date }[];
    actionItems: { item: string; completed: boolean }[];
    assignedTo: string;
    assignedOn: Date;
    remarks: { text: string; author: string; date: Date }[];
  };
  
  export type RaidFilters = {
    category?: string[];
    priority?: string[];
    status?: string[];
  };