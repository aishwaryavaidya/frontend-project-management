import { Phase,  } from '@/types/types';
import { employees } from './employee';

export const initialPhases: Phase[] = [
  {
    id: 1,
    name: "Requirements Gathering",
    milestones: [
      {
        id: 1,
        index: 1,
        name: "Business Requirements",
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 15),
        progress: 100,
        clientSpoc: "John Smith",
        apSpoc: "Alice Johnson",
        tasks: [
          {
            id: 1,
            index: "1.1",
            name: "Stakeholder Interviews",
            startDate: new Date(2024, 0, 1),
            endDate: new Date(2024, 0, 5),
            progress: 100,
            clientSpoc: "John Smith",
            apSpoc: "Alice Johnson",
            projectManager: "Mike Wilson",
            assignments: [
              {
                id: 1,
                employeeId: employees[0].id,
                employeeName: employees[0].name,
                role: employees[0].role,
                percentage: 70
              },
              {
                id: 2,
                employeeId: employees[1].id,
                employeeName: employees[1].name,
                role: employees[1].role,
                percentage: 30
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "Design",
    milestones: [
      {
        id: 2,
        index: 1,
        name: "System Architecture",
        startDate: new Date(2024, 0, 16),
        endDate: new Date(2024, 1, 15),
        progress: 60,
        clientSpoc: "Sarah Wilson",
        apSpoc: "Bob Miller",
        tasks: [
          {
            id: 2,
            index: "2.1",
            name: "Architecture Design",
            startDate: new Date(2024, 0, 16),
            endDate: new Date(2024, 0, 31),
            progress: 80,
            clientSpoc: "Sarah Wilson",
            apSpoc: "Bob Miller",
            projectManager: "David Clark",
            assignments: []
          }
        ]
      }
    ]
  },

  {
    id: 3,
    name: "Development",
    milestones: [
      {
        id: 3,
        index: 1,
        name: "System Architecture",
        startDate: new Date(2024, 0, 16),
        endDate: new Date(2024, 1, 15),
        progress: 60,
        clientSpoc: "Sarah Wilson",
        apSpoc: "Bob Miller",
        tasks: [
          {
            id: 3,
            index: "3.1",
            name: "System Communication",
            startDate: new Date(2024, 0, 16),
            endDate: new Date(2024, 0, 31),
            progress: 80,
            clientSpoc: "Sarah Wilson",
            apSpoc: "Bob Miller",
            projectManager: "David Clark",
            assignments: []
          }
        ]
      }
    ]
  }
];