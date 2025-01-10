import { Phase } from '@/types/types';
import { employees } from './employee';

export const initialPhases: Phase[] = [
  {
    id: 1,
    name: "Initiated",
    milestones: [
      {
        id: 1,
        index: 1,
        name: "Pre Project Initialization",
        startDate: new Date(2024, 0, 1),
        endDate: new Date(2024, 0, 7),
        progress: 100,
        clientSpoc: "Jane Doe",
        apSpoc: "John Doe",
        tasks: [
          {
            id: 1,
            index: "1.1",
            name: "Scope of work documentation",
            startDate: new Date(2024, 0, 1),
            endDate: new Date(2024, 0, 2),
            progress: 100,
            clientSpoc: "Jane Doe",
            apSpoc: "John Doe",
            projectManager: "Sarah Brown",
            assignments: []
          },
          {
            id: 2,
            index: "1.2",
            name: "SOW + BOQ + Quotation review & Sign-off",
            startDate: new Date(2024, 0, 2),
            endDate: new Date(2024, 0, 3),
            progress: 100,
            clientSpoc: "Jane Doe",
            apSpoc: "John Doe",
            projectManager: "Sarah Brown",
            assignments: []
          },
          {
            id: 3,
            index: "1.3",
            name: "PR/PO/LOI release / confirmation",
            startDate: new Date(2024, 0, 3),
            endDate: new Date(2024, 0, 4),
            progress: 100,
            clientSpoc: "Jane Doe",
            apSpoc: "John Doe",
            projectManager: "Sarah Brown",
            assignments: []
          },
          {
            id: 4,
            index: "1.4",
            name: "Customer Project manager identification",
            startDate: new Date(2024, 0, 4),
            endDate: new Date(2024, 0, 5),
            progress: 100,
            clientSpoc: "Jane Doe",
            apSpoc: "John Doe",
            projectManager: "Sarah Brown",
            assignments: []
          },
          {
            id: 5,
            index: "1.5",
            name: "AP Project Team Formation",
            startDate: new Date(2024, 0, 5),
            endDate: new Date(2024, 0, 6),
            progress: 100,
            clientSpoc: "Jane Doe",
            apSpoc: "John Doe",
            projectManager: "Sarah Brown",
            assignments: []
          }
        ]
      }
    ]
  },

  {
    id: 2,
    name: "Requirements",
    milestones: [
      {
        id: 2,
        index: 1,
        name: "Project Initialization",
        startDate: new Date(2024, 0, 8),
        endDate: new Date(2024, 0, 15),
        progress: 80,
        clientSpoc: "Emily White",
        apSpoc: "Michael Green",
        tasks: [
          {
            id: 1,
            index: "2.1",
            name: "Project Kick-off meeting with Customer - Project overview, In scope, Out of scope, Implementation methods, Major Activities & Deliverables, dependency on the document sign-offs, system architecture",
            startDate: new Date(2024, 0, 8),
            endDate: new Date(2024, 0, 9),
            progress: 100,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 2,
            index: "2.2",
            name: "SOW + Infra requirement presentation walkthrough with Customer",
            startDate: new Date(2024, 0, 10),
            endDate: new Date(2024, 0, 11),
            progress: 90,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 3,
            index: "2.3",
            name: "Project Kick-Off meeting with Autoplant team - Internal",
            startDate: new Date(2024, 0, 11),
            endDate: new Date(2024, 0, 12),
            progress: 75,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 4,
            index: "2.4",
            name: "SOW walkthrough [Dev + Infra + Dispatch + R&D + Service + Sales + Product team]",
            startDate: new Date(2024, 0, 12),
            endDate: new Date(2024, 0, 13),
            progress: 60,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 5,
            index: "2.5",
            name: "Project Milestones [High Level] - Walkthrough with Internal team",
            startDate: new Date(2024, 0, 14),
            endDate: new Date(2024, 0, 15),
            progress: 50,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          }
        ]
      }
    ]
  }, 

  {
    id: 2,
    name: "Requirements",
    milestones: [
      {
        id: 3,
        index: 3,
        name: "Site Survey and BOQ Documentation",
        startDate: new Date(2024, 0, 16),
        endDate: new Date(2024, 0, 23),
        progress: 0,
        clientSpoc: "Emily White",
        apSpoc: "Michael Green",
        tasks: [
          {
            id: 1,
            index: "3.1",
            name: "Site Survey for Infra design, infra review",
            startDate: new Date(2024, 0, 16),
            endDate: new Date(2024, 0, 18),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 2,
            index: "3.2",
            name: "BOQ Documentation & Sign-off",
            startDate: new Date(2024, 0, 19),
            endDate: new Date(2024, 0, 23),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          }
        ]
      }
    ]
  },

  {
    id: 3,
    name: "Procurement",
    milestones: [
      {
        id: 4,
        index: 4,
        name: "Hardware Procurement AP & Client",
        startDate: new Date(2024, 0, 24),
        endDate: new Date(2024, 1, 5),
        progress: 0,
        clientSpoc: "Emily White",
        apSpoc: "Michael Green",
        tasks: [
          {
            id: 1,
            index: "4.1",
            name: "Autoplant hardware procurement [for hardware delta post site visit]",
            startDate: new Date(2024, 0, 24),
            endDate: new Date(2024, 0, 29),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 2,
            index: "4.2",
            name: "Client infra hardware procurement [post site visit]",
            startDate: new Date(2024, 0, 30),
            endDate: new Date(2024, 1, 5),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          }
        ]
      }
    ]
  },

  {
    id: 4,
    name: "Design",
    milestones: [
      {
        id: 5,
        index: 5,
        name: "Functional Design Documentation",
        startDate: new Date(2024, 1, 6),
        endDate: new Date(2024, 1, 20),
        progress: 0,
        clientSpoc: "Emily White",
        apSpoc: "Michael Green",
        tasks: [
          {
            id: 1,
            index: "5.1",
            name: "Requirement gathering session with Business users and ERP team",
            startDate: new Date(2024, 1, 6),
            endDate: new Date(2024, 1, 8),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 2,
            index: "5.2",
            name: "BRD documentation",
            startDate: new Date(2024, 1, 9),
            endDate: new Date(2024, 1, 12),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 3,
            index: "5.3",
            name: "BRD sign-off",
            startDate: new Date(2024, 1, 13),
            endDate: new Date(2024, 1, 14),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 4,
            index: "5.4",
            name: "FRD documentation",
            startDate: new Date(2024, 1, 15),
            endDate: new Date(2024, 1, 18),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 5,
            index: "5.5",
            name: "FRD Sign-off",
            startDate: new Date(2024, 1, 19),
            endDate: new Date(2024, 1, 20),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          }
        ]
      },
      {
        id: 6,
        index: 6,
        name: "Integration Design Documentation and Sign-off",
        startDate: new Date(2024, 1, 21),
        endDate: new Date(2024, 2, 3),
        progress: 0,
        clientSpoc: "Emily White",
        apSpoc: "Michael Green",
        tasks: [
          {
            id: 1,
            index: "6.1",
            name: "Integration discussion with ERP team - Outbound business user",
            startDate: new Date(2024, 1, 21),
            endDate: new Date(2024, 1, 25),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 2,
            index: "6.2",
            name: "Integration discussion with ERP team - Inbound business user",
            startDate: new Date(2024, 1, 26),
            endDate: new Date(2024, 1, 29),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 3,
            index: "6.3",
            name: "Integration document sign-off",
            startDate: new Date(2024, 1, 30),
            endDate: new Date(2024, 2, 3),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          }
        ]
      },
      {
        id: 7,
        index: 7,
        name: "Solution Architecture Design Documentation",
        startDate: new Date(2024, 2, 4),
        endDate: new Date(2024, 2, 10),
        progress: 0,
        clientSpoc: "Emily White",
        apSpoc: "Michael Green",
        tasks: [
          {
            id: 1,
            index: "7.1",
            name: "Solution Architecture Design Documentation",
            startDate: new Date(2024, 2, 4),
            endDate: new Date(2024, 2, 6),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 2,
            index: "7.2",
            name: "Solution Architecture Design Document Walkthrough Session",
            startDate: new Date(2024, 2, 7),
            endDate: new Date(2024, 2, 8),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          },
          {
            id: 3,
            index: "7.3",
            name: "Solution Architecture Design Document Sign-off",
            startDate: new Date(2024, 2, 9),
            endDate: new Date(2024, 2, 10),
            progress: 0,
            clientSpoc: "Emily White",
            apSpoc: "Michael Green",
            projectManager: "David Wilson",
            assignments: []
          }
        ]
      }
    ]
  },

]

    
      