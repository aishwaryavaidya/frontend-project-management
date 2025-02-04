const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const project = await prisma.project.create({
    data: {
      name: 'Enterprise System Upgrade',
      description: 'A project to upgrade enterprise systems with new security features and improved performance.',
      raidItems: {
        create: [
          {
            category: 'Risk',
            type: 'Security Breach',
            milestoneNo: 1,
            dateRaised: new Date('2024-01-10'),
            sprintDate: new Date('2024-02-01'),
            probability: 80,
            preventiveAction: 'Implement strict firewall policies',
            status: 'open',
            impact: 'High data loss potential',
            priority: 'Extreme',
            confirmedBy: 'Security Team',
            confirmationDate: new Date('2024-01-15'),
            mitigationPlan: JSON.stringify([{ item: 'Enhance encryption', date: new Date('2024-02-05') }]),
            owner: 'CISO',
            activitiesLog: JSON.stringify([{ activity: 'Reviewed risk assessment', date: new Date('2024-01-20') }]),
            actionItems: JSON.stringify([{ item: 'Conduct security audit', completed: false }]),
            assignedTo: 'Cybersecurity Team',
            assignedOn: new Date('2024-01-18'),
            remarks: JSON.stringify([{ text: 'Critical issue', author: 'CTO', date: new Date('2024-01-21') }]),
          },
          {
            category: 'Assumption',
            type: 'Third-party API availability',
            milestoneNo: 2,
            dateRaised: new Date('2024-01-15'),
            sprintDate: new Date('2024-02-10'),
            probability: 60,
            preventiveAction: 'Verify SLA commitments',
            status: 'in progress',
            impact: 'Potential project delay',
            priority: 'High',
            confirmedBy: 'Project Manager',
            confirmationDate: new Date('2024-01-17'),
            mitigationPlan: JSON.stringify([{ item: 'Identify alternative APIs', date: new Date('2024-02-12') }]),
            owner: 'Tech Lead',
            activitiesLog: JSON.stringify([{ activity: 'Checked API documentation', date: new Date('2024-01-22') }]),
            actionItems: JSON.stringify([{ item: 'Contact API provider', completed: false }]),
            assignedTo: 'Integration Team',
            assignedOn: new Date('2024-01-19'),
            remarks: JSON.stringify([{ text: 'Need contingency plan', author: 'Product Owner', date: new Date('2024-01-23') }]),
          },
          {
            category: 'Issue',
            type: 'Server Downtime',
            milestoneNo: 3,
            dateRaised: new Date('2024-02-05'),
            sprintDate: new Date('2024-02-20'),
            probability: null,
            preventiveAction: 'Deploy redundant systems',
            status: 'closed',
            impact: 'Loss of service availability',
            priority: 'Medium',
            confirmedBy: 'Infrastructure Team',
            confirmationDate: new Date('2024-02-06'),
            mitigationPlan: JSON.stringify([{ item: 'Implement load balancing', date: new Date('2024-02-18') }]),
            owner: 'IT Ops Lead',
            dateClosed: new Date('2024-02-25'),
            activitiesLog: JSON.stringify([{ activity: 'Deployed failover servers', date: new Date('2024-02-24') }]),
            actionItems: JSON.stringify([{ item: 'Monitor server health', completed: true }]),
            assignedTo: 'DevOps Team',
            assignedOn: new Date('2024-02-07'),
            remarks: JSON.stringify([{ text: 'Resolved successfully', author: 'CIO', date: new Date('2024-02-26') }]),
          },
          {
            category: 'Dependency',
            type: 'Vendor Software Release Delay',
            milestoneNo: 4,
            dateRaised: new Date('2024-02-10'),
            sprintDate: new Date('2024-03-01'),
            probability: 70,
            preventiveAction: 'Request beta access',
            status: 'open',
            impact: 'Project schedule slippage',
            priority: 'High',
            confirmedBy: 'Procurement Manager',
            confirmationDate: new Date('2024-02-12'),
            mitigationPlan: [{ item: 'Negotiate early access', date: new Date('2024-02-20') }],
            owner: 'Procurement Lead',
            activitiesLog: [{ activity: 'Reviewed vendor roadmap', date: new Date('2024-02-15') }],
            actionItems: [{ item: 'Coordinate with vendor', completed: false }],
            assignedTo: 'Procurement Team',
            assignedOn: new Date('2024-02-13'),
            remarks: [{ text: 'High dependency risk', author: 'PM', date: new Date('2024-02-17') }],
          },
          // Add 11 more dummy RAID items here with different variations
          // Risk Items
          {
            category: 'Risk',
            type: 'Security vulnerability',
            probability: 75,
            status: 'open',
            priority: 'High',
            preventiveAction: 'Implement secure coding practices',
            mitigationPlan: JSON.stringify([
              { item: 'Implement firewall rules', date: new Date() }
            ]),
            impact: 'Data breach risk',
            owner: 'John Doe',
            remarks: [{ text: 'Review completed', author: 'QA Team', date: new Date() }]
          },
          {
            category: 'Risk',
            type: 'Server downtime',
            probability: 60,
            status: 'in progress',
            priority: 'Extreme',
            preventiveAction: 'Set up redundant servers',
            mitigationPlan: [{ item: 'Enable cloud failover', date: new Date() }],
            impact: 'Potential service disruption',
            owner: 'IT Admin'
          },
          
          // Assumption Items
          {
            category: 'Assumption',
            type: 'Stable API support',
            status: 'open',
            priority: 'Medium',
            impact: 'Delays in integration',
            confirmedBy: 'Tech Lead',
            confirmationDate: new Date(),
            remarks: [{ text: 'Needs verification from vendor', author: 'PM', date: new Date() }]
          },
          {
            category: 'Assumption',
            type: 'Availability of key personnel',
            status: 'closed',
            priority: 'Low',
            impact: 'Minor delays in approval process'
          },
          
          // Issue Items
          {
            category: 'Issue',
            type: 'Bug in payment module',
            status: 'in progress',
            priority: 'High',
            impact: 'Payments failing for 30% of users',
            assignedTo: 'Dev Team',
            assignedOn: new Date(),
            activitiesLog: [{ activity: 'Fix initiated', date: new Date() }]
          },
          {
            category: 'Issue',
            type: 'Performance bottleneck in API',
            status: 'open',
            priority: 'Medium',
            impact: 'High response time affecting users',
            owner: 'Backend Team',
            mitigationPlan: [{ item: 'Optimize database queries', date: new Date() }]
          },
          
          // Dependency Items
          {
            category: 'Dependency',
            type: 'Third-party API integration',
            status: 'open',
            priority: 'Medium',
            impact: 'Project timeline delay',
            actionItems: [{ item: 'Contact vendor', completed: false }]
          },
          {
            category: 'Dependency',
            type: 'Hardware procurement',
            status: 'closed',
            priority: 'High',
            impact: 'Delays in deployment',
            remarks: [{ text: 'Hardware received', author: 'Ops Team', date: new Date() }]
          },
          
          // Additional RAID items
          {
            category: 'Risk',
            type: 'Budget constraints',
            probability: 50,
            status: 'open',
            priority: 'High',
            impact: 'Scope reduction',
            owner: 'Finance Team'
          },
          {
            category: 'Risk',
            type: 'Regulatory compliance',
            probability: 80,
            status: 'in progress',
            priority: 'Extreme',
            impact: 'Legal repercussions',
            assignedTo: 'Legal Team'
          },
          {
            category: 'Assumption',
            type: 'End-user adoption',
            status: 'open',
            priority: 'Medium',
            impact: 'Training required for adoption',
            remarks: [{ text: 'Survey planned', author: 'UX Team', date: new Date() }]
          },
          {
            category: 'Issue',
            type: 'Supplier delay',
            status: 'open',
            priority: 'High',
            impact: 'Manufacturing delay',
            mitigationPlan: [{ item: 'Identify alternative suppliers', date: new Date() }]
          },
          {
            category: 'Dependency',
            type: 'Testing environment availability',
            status: 'closed',
            priority: 'Medium',
            impact: 'Testing phase delayed'
          }
        ],
      },
    },
  });

  console.log(`Created project with id: ${project.id}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
