const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedModules() {
  const defaultModules = [
    { name: 'VC' },
    { name: 'Inplant-IB' },
    { name: 'Inplant-OB' },
    { name: 'Enroute' },
    { name: 'EpoD' },
  ];

  console.log('Seeding modules...');
  
  for (const module of defaultModules) {
    const existingModule = await prisma.module.findFirst({
      where: { name: module.name }
    });
    
    if (!existingModule) {
      await prisma.module.create({
        data: module
      });
      console.log(`Created module: ${module.name}`);
    } else {
      console.log(`Module already exists: ${module.name}`);
    }
  }
}

async function seedProjectsForPortfolio() {
  console.log('Seeding project manager portfolio data...');
  
  // 1. Create a project manager user if it doesn't exist
  let projectManager = await prisma.user.findFirst({
    where: { 
      role: 'PROJECT_MANAGER',
      email: 'pm@example.com'
    }
  });
  
  if (!projectManager) {
    projectManager = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'pm@example.com',
        password: '$2a$10$fYyKxIwDfnvXkDbI8/yvouQdQ.KbvLUUPVJWrTbzj3jp1QO8WtAzK', // 'password123'
        employeeId: 'EMP1001',
        role: 'PROJECT_MANAGER',
      }
    });
    console.log('Created project manager user:', projectManager.email);
  } else {
    console.log('Using existing project manager:', projectManager.email);
  }
  
  // 2. Create customers
  const customers = [
    { name: 'TATA Chemicals', vertical: 'chemical' },
    { name: 'UltraTech Cement', vertical: 'cement' },
    { name: 'JSW Steel', vertical: 'metals' }
  ];
  
  const createdCustomers = [];
  
  for (const customerData of customers) {
    const existingCustomer = await prisma.customer.findFirst({
      where: { name: customerData.name }
    });
    
    if (!existingCustomer) {
      const customer = await prisma.customer.create({
        data: customerData
      });
      createdCustomers.push(customer);
      console.log(`Created customer: ${customer.name}`);
    } else {
      createdCustomers.push(existingCustomer);
      console.log(`Using existing customer: ${existingCustomer.name}`);
    }
  }
  
  // 3. Create sites for each customer
  const sites = [
    { customerId: createdCustomers[0].id, name: 'Babrala Plant', code: 'BAB' },
    { customerId: createdCustomers[0].id, name: 'Mithapur Plant', code: 'MIT' },
    { customerId: createdCustomers[1].id, name: 'Kotputli Plant', code: 'KOT' },
    { customerId: createdCustomers[1].id, name: 'Gujarat Plant', code: 'GUJ' },
    { customerId: createdCustomers[2].id, name: 'Vijayanagar Plant', code: 'VIJ' }
  ];
  
  const createdSites = [];
  
  for (const siteData of sites) {
    const existingSite = await prisma.site.findFirst({
      where: { 
        customerId: siteData.customerId,
        code: siteData.code
      }
    });
    
    if (!existingSite) {
      const site = await prisma.site.create({
        data: siteData
      });
      createdSites.push(site);
      console.log(`Created site: ${site.name} (${site.code})`);
    } else {
      createdSites.push(existingSite);
      console.log(`Using existing site: ${existingSite.name} (${existingSite.code})`);
    }
  }
  
  // 4. Create modules if they don't exist
  const moduleNames = ['Enroute', 'VC', 'Inplant-IB', 'Inplant-OB', 'EpoD'];
  const createdModules = [];
  
  for (const moduleName of moduleNames) {
    let module = await prisma.module.findUnique({
      where: { name: moduleName }
    });
    
    if (!module) {
      module = await prisma.module.create({
        data: { name: moduleName }
      });
      console.log(`Created module: ${module.name}`);
    } else {
      console.log(`Using existing module: ${module.name}`);
    }
    
    createdModules.push(module);
  }
  
  // 5. Create purchase orders
  const purchaseOrders = [
    { 
      customerId: createdCustomers[0].id, 
      orderType: 'External', 
      poNumber: 'TC-2023-001', 
      issueDate: new Date('2023-05-01'), 
      expiryDate: new Date('2024-05-01'), 
      amount: 500000, 
      description: 'Supply chain visibility implementation' 
    },
    { 
      customerId: createdCustomers[1].id, 
      orderType: 'External', 
      poNumber: 'ULT-2023-015', 
      issueDate: new Date('2023-06-15'), 
      expiryDate: new Date('2024-06-15'), 
      amount: 750000, 
      description: 'End-to-end logistics management system' 
    },
    { 
      customerId: createdCustomers[2].id, 
      orderType: 'Internal', 
      poNumber: 'JSW-2023-INT-008', 
      issueDate: new Date('2023-07-10'), 
      expiryDate: new Date('2024-12-31'), 
      amount: 650000, 
      description: 'Logistics operations optimization' 
    }
  ];
  
  const createdPOs = [];
  
  for (const poData of purchaseOrders) {
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: { 
        customerId: poData.customerId,
        poNumber: poData.poNumber
      }
    });
    
    if (!existingPO) {
      const po = await prisma.purchaseOrder.create({
        data: poData
      });
      createdPOs.push(po);
      console.log(`Created purchase order: ${po.poNumber}`);
    } else {
      createdPOs.push(existingPO);
      console.log(`Using existing purchase order: ${existingPO.poNumber}`);
    }
  }
  
  // 6. Create PO_Site links
  const poSiteLinks = [
    { poId: createdPOs[0].id, siteId: createdSites[0].id },
    { poId: createdPOs[0].id, siteId: createdSites[1].id },
    { poId: createdPOs[1].id, siteId: createdSites[2].id },
    { poId: createdPOs[1].id, siteId: createdSites[3].id },
    { poId: createdPOs[2].id, siteId: createdSites[4].id }
  ];
  
  const createdPOSites = [];
  
  for (const poSiteData of poSiteLinks) {
    const existingPOSite = await prisma.pO_Site.findFirst({
      where: { 
        poId: poSiteData.poId,
        siteId: poSiteData.siteId
      }
    });
    
    if (!existingPOSite) {
      const poSite = await prisma.pO_Site.create({
        data: poSiteData
      });
      createdPOSites.push(poSite);
      console.log(`Created PO-Site link`);
    } else {
      createdPOSites.push(existingPOSite);
      console.log(`Using existing PO-Site link`);
    }
  }
  
  // 7. Create PO_Site_Module links
  const moduleAssignments = [
    // TATA Chemicals Babrala - Enroute
    { poSiteId: createdPOSites[0].id, moduleId: createdModules[0].id },
    // TATA Chemicals Babrala - VC
    { poSiteId: createdPOSites[0].id, moduleId: createdModules[1].id },
    // TATA Chemicals Mithapur - Inplant-IB
    { poSiteId: createdPOSites[1].id, moduleId: createdModules[2].id },
    // UltraTech Kotputli - EpoD
    { poSiteId: createdPOSites[2].id, moduleId: createdModules[4].id },
    // UltraTech Gujarat - Enroute
    { poSiteId: createdPOSites[3].id, moduleId: createdModules[0].id },
    // JSW Vijayanagar - Inplant-OB
    { poSiteId: createdPOSites[4].id, moduleId: createdModules[3].id }
  ];
  
  const createdPOSiteModules = [];
  
  for (const moduleData of moduleAssignments) {
    const existingPOSiteModule = await prisma.pO_Site_Module.findFirst({
      where: { 
        poSiteId: moduleData.poSiteId,
        moduleId: moduleData.moduleId
      }
    });
    
    if (!existingPOSiteModule) {
      const poSiteModule = await prisma.pO_Site_Module.create({
        data: moduleData
      });
      createdPOSiteModules.push(poSiteModule);
      console.log(`Created PO-Site-Module link`);
    } else {
      createdPOSiteModules.push(existingPOSiteModule);
      console.log(`Using existing PO-Site-Module link`);
    }
  }
  
  // 8. Assign modules to project manager
  for (const poSiteModule of createdPOSiteModules) {
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        poSiteModuleId: poSiteModule.id,
        projectManagerId: projectManager.id
      }
    });
    
    if (!existingAssignment) {
      await prisma.assignment.create({
        data: {
          poSiteModuleId: poSiteModule.id,
          projectManagerId: projectManager.id
        }
      });
      console.log(`Assigned module to project manager`);
    } else {
      console.log(`Module already assigned to project manager`);
    }
  }
  
  // 9. Create projects with different states (some with plans, some without)
  const projectData = [
    {
      name: 'TATA Chemicals Logistics Optimization',
      code: 'TCL-2023-001',
      modules: [createdPOSiteModules[0].id, createdPOSiteModules[1].id],
      hasPlan: true
    },
    {
      name: 'UltraTech Digital Transformation',
      code: 'ULT-2023-015',
      modules: [createdPOSiteModules[3].id],
      hasPlan: false
    },
    {
      name: 'JSW Steel Supply Chain Visibility',
      code: 'JSW-2023-008',
      modules: [createdPOSiteModules[5].id],
      hasPlan: true
    }
  ];
  
  for (const project of projectData) {
    // Check if project exists
    const existingProject = await prisma.pMProject.findUnique({
      where: { code: project.code }
    });
    
    if (!existingProject) {
      // Create site structure for metadata
      type SiteModule = {
        id: string;
        name: string;
      };
      
      type SiteInfo = {
        id: string;
        name: string;
        code: string;
        modules: SiteModule[];
      };
      
      type MetadataStructure = {
        sites: SiteInfo[];
      };
      
      const metadataStructure: MetadataStructure = { sites: [] };
      const sitesMap = new Map<string, SiteInfo>();
      
      for (const moduleId of project.modules) {
        const poSiteModule = await prisma.pO_Site_Module.findUnique({
          where: { id: moduleId },
          include: {
            module: true,
            poSite: {
              include: {
                site: true
              }
            }
          }
        });
        
        if (poSiteModule) {
          const site = poSiteModule.poSite.site;
          const module = poSiteModule.module;
          
          if (!sitesMap.has(site.id)) {
            sitesMap.set(site.id, {
              id: site.id,
              name: site.name,
              code: site.code,
              modules: []
            });
          }
          
          sitesMap.get(site.id)?.modules.push({
            id: module.id,
            name: module.name
          });
        }
      }
      
      metadataStructure.sites = Array.from(sitesMap.values());
      
      // Create project
      const newProject = await prisma.pMProject.create({
        data: {
          name: project.name,
          code: project.code,
          projectManagerId: projectManager.id,
          metadata: metadataStructure
        }
      });
      
      console.log(`Created project: ${newProject.name} (${newProject.code})`);
      
      // Create project modules
      for (const moduleId of project.modules) {
        await prisma.projectModule.create({
          data: {
            projectId: newProject.id,
            poSiteModuleId: moduleId
          }
        });
      }
      
      // Create project plan if needed
      if (project.hasPlan) {
        const projectPlan = await prisma.projectPlan.create({
          data: {
            projectId: newProject.id,
            tasks: {
              create: [
                {
                  siNo: Math.floor(Math.random() * 10000), // Random siNo to avoid conflicts
                  wbsNo: "1",
                  taskName: "Project Kickoff",
                  level: 0,
                  isParent: true,
                  startDate: new Date(),
                  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
                  duration: 30
                },
                {
                  siNo: Math.floor(Math.random() * 10000), // Random siNo to avoid conflicts
                  wbsNo: "2",
                  taskName: "Implementation",
                  level: 0,
                  isParent: true,
                  startDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), // 31 days later
                  endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days later
                  duration: 60
                }
              ]
            }
          }
        });
        
        console.log(`Created project plan for: ${newProject.code}`);
      }
    } else {
      console.log(`Project already exists: ${existingProject.name} (${existingProject.code})`);
    }
  }
  
  console.log('Portfolio seeding completed!');
}

async function main() {
  const project = await prisma.project.create({
    data: {
      name: 'Enterprise System Upgrade',
      description: 'A project to upgrade enterprise systems with new security features and improved performance.',
      raidItems: {
        create: [
          // Initial 4 items (corrected and completed)
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
            mitigationPlan: JSON.stringify([{ item: 'Negotiate early access', date: new Date('2024-02-20') }]),
            owner: 'Procurement Lead',
            activitiesLog: JSON.stringify([{ activity: 'Reviewed vendor roadmap', date: new Date('2024-02-15') }]),
            actionItems: JSON.stringify([{ item: 'Coordinate with vendor', completed: false }]),
            assignedTo: 'Procurement Team',
            assignedOn: new Date('2024-02-13'),
            remarks: JSON.stringify([{ text: 'High dependency risk', author: 'PM', date: new Date('2024-02-17') }]),
          },

          // Additional 11 items (fully completed)
          {
            category: 'Risk',
            type: 'Security vulnerability',
            milestoneNo: 5,
            dateRaised: new Date('2024-03-01'),
            sprintDate: new Date('2024-03-15'),
            probability: 75,
            preventiveAction: 'Implement secure coding practices',
            status: 'open',
            impact: 'Data breach risk',
            priority: 'High',
            confirmedBy: 'Security Lead',
            confirmationDate: new Date('2024-03-02'),
            mitigationPlan: JSON.stringify([{ item: 'Implement firewall rules', date: new Date('2024-03-05') }]),
            owner: 'John Doe',
            activitiesLog: JSON.stringify([{ activity: 'Conducted code review', date: new Date('2024-03-05') }]),
            actionItems: JSON.stringify([{ item: 'Update security protocols', completed: false }]),
            assignedTo: 'Dev Team',
            assignedOn: new Date('2024-03-03'),
            remarks: JSON.stringify([{ text: 'Review completed', author: 'QA Team', date: new Date('2024-03-04') }]),
          },
          {
            category: 'Risk',
            type: 'Server downtime',
            milestoneNo: 6,
            dateRaised: new Date('2024-03-10'),
            sprintDate: new Date('2024-03-20'),
            probability: 60,
            preventiveAction: 'Set up redundant servers',
            status: 'in progress',
            impact: 'Potential service disruption',
            priority: 'Extreme',
            confirmedBy: 'Infrastructure Manager',
            confirmationDate: new Date('2024-03-11'),
            mitigationPlan: JSON.stringify([{ item: 'Enable cloud failover', date: new Date('2024-03-15') }]),
            owner: 'IT Admin',
            activitiesLog: JSON.stringify([{ activity: 'Initiated cloud setup', date: new Date('2024-03-13') }]),
            actionItems: JSON.stringify([{ item: 'Test failover mechanism', completed: false }]),
            assignedTo: 'Cloud Team',
            assignedOn: new Date('2024-03-12'),
            remarks: JSON.stringify([{ text: 'Critical infrastructure update needed', author: 'SysAdmin', date: new Date('2024-03-14') }]),
          },
          {
            category: 'Assumption',
            type: 'Stable API support',
            milestoneNo: 7,
            dateRaised: new Date('2024-03-05'),
            sprintDate: new Date('2024-03-25'),
            probability: 65,
            preventiveAction: 'Monitor API health',
            status: 'open',
            impact: 'Delays in integration',
            priority: 'Medium',
            confirmedBy: 'Tech Lead',
            confirmationDate: new Date('2024-03-06'),
            mitigationPlan: JSON.stringify([{ item: 'Develop mock APIs', date: new Date('2024-03-18') }]),
            owner: 'API Team',
            activitiesLog: JSON.stringify([{ activity: 'Performed API stress test', date: new Date('2024-03-10') }]),
            actionItems: JSON.stringify([{ item: 'Schedule vendor meeting', completed: false }]),
            assignedTo: 'Integration Team',
            assignedOn: new Date('2024-03-07'),
            remarks: JSON.stringify([{ text: 'Needs verification from vendor', author: 'PM', date: new Date('2024-03-08') }]),
          },
          {
            category: 'Assumption',
            type: 'Availability of key personnel',
            milestoneNo: 8,
            dateRaised: new Date('2024-03-15'),
            sprintDate: new Date('2024-04-01'),
            probability: 40,
            preventiveAction: 'Cross-train team members',
            status: 'closed',
            impact: 'Minor delays in approval process',
            priority: 'Low',
            confirmedBy: 'HR Manager',
            confirmationDate: new Date('2024-03-16'),
            mitigationPlan: JSON.stringify([{ item: 'Create backup staffing plan', date: new Date('2024-03-20') }]),
            owner: 'HR Coordinator',
            dateClosed: new Date('2024-03-25'),
            activitiesLog: JSON.stringify([{ activity: 'Conducted training sessions', date: new Date('2024-03-22') }]),
            actionItems: JSON.stringify([{ item: 'Update resource plan', completed: true }]),
            assignedTo: 'HR Team',
            assignedOn: new Date('2024-03-17'),
            remarks: JSON.stringify([{ text: 'Staffing plan approved', author: 'HR Director', date: new Date('2024-03-24') }]),
          },
          {
            category: 'Issue',
            type: 'Bug in payment module',
            milestoneNo: 9,
            dateRaised: new Date('2024-04-01'),
            sprintDate: new Date('2024-04-15'),
            probability: null,
            preventiveAction: 'Enhance testing procedures',
            status: 'in progress',
            impact: 'Payments failing for 30% of users',
            priority: 'High',
            confirmedBy: 'QA Lead',
            confirmationDate: new Date('2024-04-02'),
            mitigationPlan: JSON.stringify([{ item: 'Rollback to stable version', date: new Date('2024-04-05') }]),
            owner: 'Dev Manager',
            activitiesLog: JSON.stringify([{ activity: 'Fix initiated', date: new Date('2024-04-03') }]),
            actionItems: JSON.stringify([{ item: 'Test payment gateway', completed: false }]),
            assignedTo: 'Dev Team',
            assignedOn: new Date('2024-04-02'),
            remarks: JSON.stringify([{ text: 'High priority fix required', author: 'Product Manager', date: new Date('2024-04-04') }]),
          },
          {
            category: 'Issue',
            type: 'Performance bottleneck in API',
            milestoneNo: 10,
            dateRaised: new Date('2024-04-10'),
            sprintDate: new Date('2024-04-20'),
            probability: null,
            preventiveAction: 'Implement caching mechanisms',
            status: 'open',
            impact: 'High response time affecting users',
            priority: 'Medium',
            confirmedBy: 'Performance Team',
            confirmationDate: new Date('2024-04-11'),
            mitigationPlan: JSON.stringify([{ item: 'Optimize database queries', date: new Date('2024-04-15') }]),
            owner: 'Backend Team',
            activitiesLog: JSON.stringify([{ activity: 'Identified slow queries', date: new Date('2024-04-12') }]),
            actionItems: JSON.stringify([{ item: 'Refactor codebase', completed: false }]),
            assignedTo: 'Backend Developers',
            assignedOn: new Date('2024-04-12'),
            remarks: JSON.stringify([{ text: 'Requires DB optimization', author: 'Tech Lead', date: new Date('2024-04-13') }]),
          },
          {
            category: 'Dependency',
            type: 'Third-party API integration',
            milestoneNo: 11,
            dateRaised: new Date('2024-04-05'),
            sprintDate: new Date('2024-04-25'),
            probability: 55,
            preventiveAction: 'Establish communication channel',
            status: 'open',
            impact: 'Project timeline delay',
            priority: 'Medium',
            confirmedBy: 'Integration Lead',
            confirmationDate: new Date('2024-04-06'),
            mitigationPlan: JSON.stringify([{ item: 'Develop fallback solution', date: new Date('2024-04-18') }]),
            owner: 'Integration Manager',
            activitiesLog: JSON.stringify([{ activity: 'Reviewed API documentation', date: new Date('2024-04-08') }]),
            actionItems: JSON.stringify([{ item: 'Contact vendor', completed: false }]),
            assignedTo: 'API Team',
            assignedOn: new Date('2024-04-07'),
            remarks: JSON.stringify([{ text: 'Awaiting vendor response', author: 'Integration Specialist', date: new Date('2024-04-09') }]),
          },
          {
            category: 'Dependency',
            type: 'Hardware procurement',
            milestoneNo: 12,
            dateRaised: new Date('2024-04-15'),
            sprintDate: new Date('2024-05-01'),
            probability: 30,
            preventiveAction: 'Advance order placement',
            status: 'closed',
            impact: 'Delays in deployment',
            priority: 'High',
            confirmedBy: 'Procurement Officer',
            confirmationDate: new Date('2024-04-16'),
            mitigationPlan: JSON.stringify([{ item: 'Source alternative suppliers', date: new Date('2024-04-20') }]),
            owner: 'Procurement Manager',
            dateClosed: new Date('2024-04-25'),
            activitiesLog: JSON.stringify([{ activity: 'Order placed with vendor', date: new Date('2024-04-18') }]),
            actionItems: JSON.stringify([{ item: 'Track shipment', completed: true }]),
            assignedTo: 'Logistics Team',
            assignedOn: new Date('2024-04-17'),
            remarks: JSON.stringify([{ text: 'Hardware received', author: 'Ops Team', date: new Date('2024-04-24') }]),
          },
          {
            category: 'Risk',
            type: 'Budget constraints',
            milestoneNo: 13,
            dateRaised: new Date('2024-05-01'),
            sprintDate: new Date('2024-05-15'),
            probability: 50,
            preventiveAction: 'Optimize resource allocation',
            status: 'open',
            impact: 'Scope reduction',
            priority: 'High',
            confirmedBy: 'Finance Director',
            confirmationDate: new Date('2024-05-02'),
            mitigationPlan: JSON.stringify([{ item: 'Seek additional funding', date: new Date('2024-05-10') }]),
            owner: 'Finance Team',
            activitiesLog: JSON.stringify([{ activity: 'Conducted budget review', date: new Date('2024-05-03') }]),
            actionItems: JSON.stringify([{ item: 'Submit budget request', completed: false }]),
            assignedTo: 'Finance Analysts',
            assignedOn: new Date('2024-05-03'),
            remarks: JSON.stringify([{ text: 'Approval pending from board', author: 'CFO', date: new Date('2024-05-05') }]),
          },
          {
            category: 'Risk',
            type: 'Regulatory compliance',
            milestoneNo: 14,
            dateRaised: new Date('2024-05-10'),
            sprintDate: new Date('2024-05-25'),
            probability: 80,
            preventiveAction: 'Conduct compliance audit',
            status: 'in progress',
            impact: 'Legal repercussions',
            priority: 'Extreme',
            confirmedBy: 'Legal Advisor',
            confirmationDate: new Date('2024-05-11'),
            mitigationPlan: JSON.stringify([{ item: 'Update policy documentation', date: new Date('2024-05-20') }]),
            owner: 'Legal Team',
            activitiesLog: JSON.stringify([{ activity: 'Scheduled audit', date: new Date('2024-05-12') }]),
            actionItems: JSON.stringify([{ item: 'Review legal requirements', completed: false }]),
            assignedTo: 'Compliance Team',
            assignedOn: new Date('2024-05-12'),
            remarks: JSON.stringify([{ text: 'Critical compliance updates needed', author: 'Legal Counsel', date: new Date('2024-05-13') }]),
          },
          {
            category: 'Assumption',
            type: 'End-user adoption',
            milestoneNo: 15,
            dateRaised: new Date('2024-05-15'),
            sprintDate: new Date('2024-06-01'),
            probability: 70,
            preventiveAction: 'Conduct user training sessions',
            status: 'open',
            impact: 'Training required for adoption',
            priority: 'Medium',
            confirmedBy: 'UX Lead',
            confirmationDate: new Date('2024-05-16'),
            mitigationPlan: JSON.stringify([{ item: 'Develop training materials', date: new Date('2024-05-25') }]),
            owner: 'UX Team',
            activitiesLog: JSON.stringify([{ activity: 'Conducted user survey', date: new Date('2024-05-18') }]),
            actionItems: JSON.stringify([{ item: 'Schedule workshops', completed: false }]),
            assignedTo: 'Training Team',
            assignedOn: new Date('2024-05-17'),
            remarks: JSON.stringify([{ text: 'Survey planned', author: 'UX Team', date: new Date('2024-05-19') }]),
          },
        ],
      },
    },
  });

  console.log(`Created project with id: ${project.id}`);

  // Add module seeding
  await seedModules();
  
  // New seeding function for project manager portfolio
  await seedProjectsForPortfolio();
  
  console.log('Seeding complete!');
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
