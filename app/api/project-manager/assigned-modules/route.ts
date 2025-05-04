import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET /api/project-manager/assigned-modules - Get all modules assigned to the logged-in project manager
export async function GET(request: Request) {
  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const userId = session.user.id
    
    // Check if the user exists and is a project manager
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        role: true
      }
    })
    
    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Allow ADMIN and PROGRAM_MANAGER roles as well, adjust if needed
    if (!['PROJECT_MANAGER', 'PROGRAM_MANAGER', 'ADMIN'].includes(user.role)) {
      return new NextResponse(JSON.stringify({ 
        error: 'Unauthorized. Only designated roles can access assigned modules.' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // 1. Get all assignments for this project manager
      const assignments = await prisma.assignment.findMany({
        where: {
          projectManagerId: userId
        },
        include: {
          poSiteModule: {
            include: {
              module: true,
              poSite: {
                include: {
                  site: true,
                  purchaseOrder: {
                    include: {
                      customer: true
                    }
                  }
                }
              }
            }
          },
        }
      })
      
      // Extract PO Site Module IDs
      const assignedPoSiteModuleIds = assignments.map(a => a.poSiteModuleId);
      
      if (assignedPoSiteModuleIds.length === 0) {
        return new NextResponse(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 2. Find which of these modules are already part of a project
      const projectModules = await prisma.projectModule.findMany({
        where: {
          poSiteModuleId: {
            in: assignedPoSiteModuleIds
          }
        },
        select: {
          poSiteModuleId: true // Only need the ID to filter
        }
      });
      
      const projectModuleIds = new Set(projectModules.map(pm => pm.poSiteModuleId));
      
      // 3. Filter assignments to include only those *not* in a project
      const availableAssignments = assignments.filter(a => !projectModuleIds.has(a.poSiteModuleId));
      
      if (availableAssignments.length === 0) {
        return new NextResponse(JSON.stringify([]), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 4. Group the available modules by customer and then by site
      const modulesByCustomer: Record<string, {
        id: string;
        name: string;
        sites: Record<string, {
          id: string;
          name: string;
          code: string;
          modules: Array<{
            id: string; // Module ID
            name: string; // Module Name
            poSiteModuleId: string;
            assignmentId: string;
          }>;
        }>;
      }> = {};
      
      availableAssignments.forEach(assignment => {
        const poSiteModule = assignment.poSiteModule;
        if (!poSiteModule || !poSiteModule.module || !poSiteModule.poSite || !poSiteModule.poSite.site || !poSiteModule.poSite.purchaseOrder || !poSiteModule.poSite.purchaseOrder.customer) {
          console.warn(`Skipping assignment ${assignment.id} due to missing related data`);
          return; // Skip if any crucial data is missing
        }
        
        const customer = poSiteModule.poSite.purchaseOrder.customer;
        const site = poSiteModule.poSite.site;
        const module = poSiteModule.module;
        
        // Group by customer
        if (!modulesByCustomer[customer.id]) {
          modulesByCustomer[customer.id] = {
            id: customer.id,
            name: customer.name,
            sites: {}
          }
        }
        
        // Group by site
        const customerGroup = modulesByCustomer[customer.id];
        if (!customerGroup.sites[site.id]) {
          customerGroup.sites[site.id] = {
            id: site.id,
            name: site.name,
            code: site.code,
            modules: []
          }
        }
        
        // Add module to site
        customerGroup.sites[site.id].modules.push({
          id: module.id,
          name: module.name,
          poSiteModuleId: poSiteModule.id,
          assignmentId: assignment.id,
        });
      });
      
      // 5. Convert the grouped structure to an array for the frontend
      const result = Object.values(modulesByCustomer).map((customer) => ({
        ...customer,
        sites: Object.values(customer.sites)
      }));
      
      return new NextResponse(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (dbError) {
      console.error('Database error fetching assigned modules:', dbError);
      return new NextResponse(JSON.stringify({ 
        error: 'Database error: Failed to fetch assigned modules', 
        details: String(dbError) 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in GET assigned-modules:', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to fetch assigned modules', 
      details: String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 