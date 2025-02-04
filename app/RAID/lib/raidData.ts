import { v4 as uuidv4 } from 'uuid';
import type { RAIDItem, MitigationPlan, ActivityLog, ActionItem, Remark } from '@/types/raid';

const generateDummyData = (): RAIDItem[] => {
  const dummyData: RAIDItem[] = [];
  
  // Define typed arrays for each enum-like field
  const categories = ['Risk', 'Assumption', 'Dependency'] as const;
  const priorities = ['Extreme', 'High', 'Medium', 'Low'] as const;
  const statuses = ['open', 'in progress', 'closed'] as const;
  
  const types = ['CR', 'New Requirement', 'Enhancement'];
  const impacts = ['High', 'Medium', 'Low'];
  const owners = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Brown'];
  const assignees = ['Team A', 'Team B', 'Team C'];

  for (let i = 1; i <= 10; i++) {
    const dateRaised = new Date();
    dateRaised.setDate(dateRaised.getDate() - Math.floor(Math.random() * 30));
    
    const sprintDate = new Date(dateRaised);
    sprintDate.setDate(sprintDate.getDate() + Math.floor(Math.random() * 14) + 7);

    const confirmationDate = new Date(dateRaised);
    confirmationDate.setDate(confirmationDate.getDate() + 1);

    const assignedOn = new Date(dateRaised);
    assignedOn.setDate(assignedOn.getDate() + 2);

    const mitigationPlan: MitigationPlan[] = [
      { item: `Step 1: Identify root cause for issue ${i}`, date: new Date(dateRaised) },
      { item: `Step 2: Develop solution for issue ${i}`, date: new Date(dateRaised.getTime() + 86400000) },
      { item: `Step 3: Implement solution for issue ${i}`, date: new Date(dateRaised.getTime() + 86400000 * 2) }
    ];

    const activitiesLog: ActivityLog[] = [
      {
        activity: `Initial assessment for issue ${i}`,
        date: new Date(dateRaised)
      },
      {
        activity: `Preliminary analysis completed for issue ${i}`,
        date: new Date(dateRaised.getTime() + 86400000) // +1 day
      }
    ];

    const actionItems: ActionItem[] = [
      {
        item: `Action Item 1 for issue ${i}`,
        completed: Math.random() > 0.5
      },
      {
        item: `Action Item 2 for issue ${i}`,
        completed: Math.random() > 0.5
      }
    ];

    const remarks: Remark[] = [
      {
        text: `Initial remark for issue ${i}`,
        author: owners[Math.floor(Math.random() * owners.length)],
        date: new Date(dateRaised)
      },
      {
        text: `Follow-up remark for issue ${i}`,
        author: owners[Math.floor(Math.random() * owners.length)],
        date: new Date(dateRaised.getTime() + 86400000 * 2) // +2 days
      }
    ];

    dummyData.push({
      id: uuidv4(),
      milestoneNo: i,
      dateRaised: dateRaised,
      type: types[Math.floor(Math.random() * types.length)],
      sprintDate: sprintDate,
      category: categories[Math.floor(Math.random() * categories.length)],
      probability: Math.floor(Math.random() * 100),
      preventiveAction: `Preventive Action ${i}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      impact: impacts[Math.floor(Math.random() * impacts.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      confirmedBy: owners[Math.floor(Math.random() * owners.length)],
      confirmationDate: confirmationDate,
      mitigationPlan: JSON.stringify(mitigationPlan),
      owner: owners[Math.floor(Math.random() * owners.length)],
      dateClosed: Math.random() > 0.8 ? new Date(dateRaised.getTime() + 86400000 * 7) : undefined,
      activitiesLog: JSON.stringify(activitiesLog),
      actionItems: JSON.stringify(actionItems),
      assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
      assignedOn: assignedOn,
      remarks: JSON.stringify(remarks)
    });
  }

  return dummyData;
};

export const dummyData = generateDummyData();
export const categories = ['Risk', 'Assumption', 'Dependency'] as const;
export const priorities = ['Extreme', 'High', 'Medium', 'Low'] as const;
export const statuses = ['open', 'in progress', 'closed'] as const;