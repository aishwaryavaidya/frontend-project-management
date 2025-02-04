// types/raid.ts
export type MitigationPlan = {
    item: string
    date: Date
  }
  
  export type ActivityLog = {
    activity: string
    date: Date
  }
  
  export type ActionItem = {
    item: string
    completed: boolean
  }
  
  export type Remark = {
    text: string
    author: string
    date: Date
  }
  
  export type RAIDItem = {
    id: string
    projectId: string
    milestoneNo?: number | null
    dateRaised?: Date | null
    type?: string | null
    sprintDate?: Date | null
    category?: string | null
    probability?: number | null
    preventiveAction?: string | null
    status?: string | null
    impact?: string | null
    priority?: string | null
    confirmedBy?: string | null
    confirmationDate?: Date | null
    mitigationPlan: MitigationPlan[]
    owner?: string | null
    dateClosed?: Date | null
    activitiesLog: ActivityLog[]
    actionItems: ActionItem[]
    assignedTo?: string | null
    assignedOn?: Date | null
    remarks: Remark[]
  }
  
  export type Project = {
    id: string
    name: string
    description?: string | null
    createdAt: Date
    updatedAt: Date
  }
  
  export type RaidFilters = {
    search?: string
    category?: string[]
    priority?: string[]
    status?: string[]
  }