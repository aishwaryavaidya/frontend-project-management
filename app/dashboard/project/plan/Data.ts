export interface Task {
    id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    expected_start_date: Date;
    expected_end_date: Date;
    actual_start_date?: Date;
    actual_end_date?: Date;
    dependencies: string[]; // Dependencies on other tasks by ID within the same milestone
}

export interface Milestone {
    id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    expected_start_date: Date;
    expected_end_date: Date;
    actual_start_date?: Date;
    actual_end_date?: Date;
    tasks: Task[];
    dependent_milestone_id?: string; // References the previous milestone in the same phase
}

export interface Phase {
    id: string;
    name: string;
    milestones: Milestone[];
}

const projectData: Phase[] = [
    {
        id: 'phase1',
        name: 'Phase 1: Planning',
        milestones: [
            {
                id: 'm1',
                name: 'Milestone 1: Requirements',
                start_date: new Date('2024-11-01'),
                end_date: new Date('2024-11-08'),
                expected_start_date: new Date('2024-11-01'),
                expected_end_date: new Date('2024-11-08'),
                tasks: [
                    {
                        id: 'task1',
                        name: 'Gather Requirements',
                        start_date: new Date('2024-11-01'),
                        end_date: new Date('2024-11-03'),
                        expected_start_date: new Date('2024-11-01'),
                        expected_end_date: new Date('2024-11-03'),
                        dependencies: [],
                    },
                    {
                        id: 'task2',
                        name: 'Review Requirements',
                        start_date: new Date('2024-11-04'),
                        end_date: new Date('2024-11-08'),
                        expected_start_date: new Date('2024-11-04'),
                        expected_end_date: new Date('2024-11-08'),
                        dependencies: ['task1'],
                    },
                ],
            },
            {
                id: 'm2',
                name: 'Milestone 2: Design',
                start_date: new Date('2024-11-11'),
                end_date: new Date('2024-11-15'),
                expected_start_date: new Date('2024-11-11'),
                expected_end_date: new Date('2024-11-15'),
                dependent_milestone_id: 'm1',
                tasks: [
                    {
                        id: 'task3',
                        name: 'Create Design Document',
                        start_date: new Date('2024-11-11'),
                        end_date: new Date('2024-11-13'),
                        expected_start_date: new Date('2024-11-11'),
                        expected_end_date: new Date('2024-11-13'),
                        dependencies: ['task2'],
                    },
                    {
                        id: 'task4',
                        name: 'Design Review',
                        start_date: new Date('2024-11-14'),
                        end_date: new Date('2024-11-15'),
                        expected_start_date: new Date('2024-11-14'),
                        expected_end_date: new Date('2024-11-15'),
                        dependencies: ['task3'],
                    },
                ],
            },
        ],
    },
    {
        id: 'phase2',
        name: 'Phase 2: Development',
        milestones: [
            {
                id: 'm3',
                name: 'Milestone 3: Setup',
                start_date: new Date('2024-11-18'),
                end_date: new Date('2024-11-20'),
                expected_start_date: new Date('2024-11-18'),
                expected_end_date: new Date('2024-11-20'),
                dependent_milestone_id: 'm2',
                tasks: [
                    {
                        id: 'task5',
                        name: 'Task 5: Install Environment',
                        start_date: new Date('2024-11-18'),
                        end_date: new Date('2024-11-19'),
                        expected_start_date: new Date('2024-11-18'),
                        expected_end_date: new Date('2024-11-19'),
                        dependencies: [],
                    },
                    {
                        id: 'task6',
                        name: 'Task 6: Setup Database',
                        start_date: new Date('2024-11-20'),
                        end_date: new Date('2024-11-20'),
                        expected_start_date: new Date('2024-11-20'),
                        expected_end_date: new Date('2024-11-20'),
                        dependencies: ['task5'],
                    },
                ],
            },
            {
                id: 'm4',
                name: 'Milestone 4: Application Development',
                start_date: new Date('2024-11-21'),
                end_date: new Date('2024-11-25'),
                expected_start_date: new Date('2024-11-21'),
                expected_end_date: new Date('2024-11-25'),
                dependent_milestone_id: 'm3',
                tasks: [
                    {
                        id: 'task7',
                        name: 'Task 7: Develop Backend APIs',
                        start_date: new Date('2024-11-21'),
                        end_date: new Date('2024-11-23'),
                        expected_start_date: new Date('2024-11-21'),
                        expected_end_date: new Date('2024-11-23'),
                        dependencies: ['task6'],
                    },
                    {
                        id: 'task8',
                        name: 'Task 8: Implement Frontend UI',
                        start_date: new Date('2024-11-24'),
                        end_date: new Date('2024-11-25'),
                        expected_start_date: new Date('2024-11-24'),
                        expected_end_date: new Date('2024-11-25'),
                        dependencies: ['task7'],
                    },
                ],
            },
        ],
    },
];


export default projectData;
