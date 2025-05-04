import { prisma } from '@/prisma/db'

export async function initializeData() {
  try {
    console.log('Checking if database needs initialization...')
    
    // Create default modules regardless of count to ensure they all exist
    const defaultModules = ['Enroute', 'EpoD', 'Inplant-IB', 'Inplant-OB', 'VC']
    
    console.log('Creating/checking default modules...')
    // Get existing modules
    const existingModules = await prisma.module.findMany();
    const existingModuleNames = existingModules.map(m => m.name);
    
    // Find missing modules
    const missingModules = defaultModules.filter(name => !existingModuleNames.includes(name));
    
    if (missingModules.length > 0) {
      console.log(`Creating ${missingModules.length} missing modules: ${missingModules.join(', ')}`);
      for (const moduleName of missingModules) {
        await prisma.module.create({
          data: { name: moduleName }
        });
      }
    } else {
      console.log('All default modules exist');
    }
    
    // Check if customers exist
    const customerCount = await prisma.customer.count()
    if (customerCount === 0) {
      console.log('Creating sample customers...')
      const customers = [
        { name: 'UTCL (Cement)', vertical: 'Cement' },
        { name: 'Tata Steel', vertical: 'Metals' },
        { name: 'HUL', vertical: 'FMCG' },
        { name: 'Reliance Industries', vertical: 'Chemical' }
      ]
      
      for (const customer of customers) {
        await prisma.customer.create({
          data: customer
        })
      }
    }
    
    // Get created customers for reference
    const allCustomers = await prisma.customer.findMany()
    
    // Check if sites exist
    const siteCount = await prisma.site.count()
    if (siteCount === 0 && allCustomers.length > 0) {
      console.log('Creating sample sites...')
      
      // For UTCL
      const utcl = allCustomers.find(c => c.name.includes('UTCL'))
      if (utcl) {
        const utclSites = [
          { name: 'Cuttack', code: '76018', customerId: utcl.id },
          { name: 'Bhubneswar', code: '97988', customerId: utcl.id },
          { name: 'Raipur', code: '49201', customerId: utcl.id }
        ]
        
        await prisma.site.createMany({
          data: utclSites,
          skipDuplicates: true
        })
      }
      
      // For Tata Steel
      const tata = allCustomers.find(c => c.name.includes('Tata'))
      if (tata) {
        const tataSites = [
          { name: 'Jamshedpur', code: 'JMSH', customerId: tata.id },
          { name: 'Kalinganagar', code: 'KLNG', customerId: tata.id }
        ]
        
        await prisma.site.createMany({
          data: tataSites,
          skipDuplicates: true
        })
      }
    }
    
    // Check if purchase orders exist
    const poCount = await prisma.purchaseOrder.count()
    if (poCount === 0 && allCustomers.length > 0) {
      console.log('Creating sample purchase orders...')
      
      const utcl = allCustomers.find(c => c.name.includes('UTCL'))
      if (utcl) {
        await prisma.purchaseOrder.create({
          data: {
            customerId: utcl.id,
            orderType: 'External',
            poNumber: 'PO12345678',
            soNumber: 'SO87654321',
            loiNumber: 'LOI2023-001',
            issueDate: new Date(),
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            amount: '1500000',
            description: 'Implementation of various modules at UTCL sites'
          }
        })
      }
      
      const tata = allCustomers.find(c => c.name.includes('Tata'))
      if (tata) {
        await prisma.purchaseOrder.create({
          data: {
            customerId: tata.id,
            orderType: 'External',
            poNumber: 'PO-TATA-2023',
            soNumber: 'SO-TATA-2023',
            issueDate: new Date(),
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            amount: '2500000',
            description: 'Implementation of Inplant modules for Tata Steel'
          }
        })
      }
    }
    
    console.log('Database initialization check completed')
    
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

// Function to setup PO_Site_Module entries for a sample purchase order
export async function setupSamplePOSiteModules() {
  try {
    // Check if we already have po_site_module entries
    const moduleCount = await prisma.pO_Site_Module.count()
    if (moduleCount > 0) {
      return // Skip if we already have entries
    }
    
    // Get modules
    const modules = await prisma.module.findMany()
    if (modules.length === 0) {
      console.log('No modules found for setting up sample data')
      return
    }
    
    // Get purchase orders
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        customer: true
      }
    })
    
    if (purchaseOrders.length === 0) {
      console.log('No purchase orders found for setting up sample data')
      return
    }
    
    // For each PO, get sites and set up modules
    for (const po of purchaseOrders) {
      // Get sites for this customer
      const sites = await prisma.site.findMany({
        where: {
          customerId: po.customerId
        }
      })
      
      if (sites.length === 0) continue
      
      for (const site of sites) {
        // Create PO_Site
        const poSite = await prisma.pO_Site.create({
          data: {
            poId: po.id,
            siteId: site.id
          }
        })
        
        // Create PO_Site_Module entries for random modules
        const randomModules = getRandomModules(modules, Math.floor(Math.random() * 3) + 1)
        
        for (const module of randomModules) {
          await prisma.pO_Site_Module.create({
            data: {
              poSiteId: poSite.id,
              moduleId: module.id
            }
          })
        }
      }
    }
    
    console.log('Sample PO site modules set up successfully')
  } catch (error) {
    console.error('Error setting up sample PO site modules:', error)
  }
}

// Helper function to get random modules
function getRandomModules(modules: any[], count: number) {
  const shuffled = [...modules].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.min(count, modules.length))
} 