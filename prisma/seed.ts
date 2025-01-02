import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Define the phases
  const phases = [
    'Requirement Gathering',
    'Design',
    'In Dev',
    'H/W Infra',
    'Support Transition',
  ];

  for (const phaseName of phases) {
    // Create the phase
    const phase = await prisma.phase.create({
      data: {
        name: phaseName,
        milestones: {
          create: [
            {
              index: 1,
              name: `${phaseName} - Milestone 1`,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-10'),
              progress: 50,
              clientSpoc: 'Client A',
              apSpoc: 'AP SPOC A',
              tasks: {
                create: [
                  {
                    index: '1.1',
                    name: `Task 1 for ${phaseName}`,
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-10'),
                    progress: 50,
                    clientSpoc: 'Client A',
                    apSpoc: 'AP SPOC A',
                  },
                  {
                    index: '1.2',
                    name: `Task 2 for ${phaseName}`,
                    startDate: new Date('2024-01-11'),
                    endDate: new Date('2024-01-20'),
                    progress: 20,
                    clientSpoc: 'Client B',
                    apSpoc: 'AP SPOC B',
                  },
                ],
              },
            },
            {
              index: 2,
              name: `${phaseName} - Milestone 2`,
              startDate: new Date('2024-01-11'),
              endDate: new Date('2024-01-20'),
              progress: 70,
              clientSpoc: 'Client C',
              apSpoc: 'AP SPOC C',
              tasks: {
                create: [
                  {
                    index: '2.1',
                    name: `Task 3 for ${phaseName}`,
                    startDate: new Date('2024-01-21'),
                    endDate: new Date('2024-01-30'),
                    progress: 80,
                    clientSpoc: 'Client D',
                    apSpoc: 'AP SPOC D',
                  },
                ],
              },
            },
          ],
        },
      },
    });

    console.log(`Created phase: ${phase.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
