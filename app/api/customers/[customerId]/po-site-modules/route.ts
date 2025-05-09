import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/customers/[customerId]/po-site-modules - Get all site modules for a customer
export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params
    
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId
      }
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    // Get all purchase orders for this customer
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        customerId
      },
      include: {
        poSites: {
          include: {
            site: true,
            poSiteModules: {
              include: {
                module: true,
                assignments: {
                  include: {
                    projectManager: true
                  }
                }
              }
            }
          }
        }
      }
    })
    
    // Extract site modules and check assignment status
    const siteModules = []
    
    for (const po of purchaseOrders) {
      for (const poSite of po.poSites) {
        for (const poSiteModule of poSite.poSiteModules) {
          const isAssigned = poSiteModule.assignments.length > 0
          
          siteModules.push({
            id: poSiteModule.id,
            moduleId: poSiteModule.moduleId,
            moduleName: poSiteModule.module.name,
            poSiteId: poSiteModule.poSiteId,
            siteId: poSite.siteId,
            siteName: poSite.site.name,
            siteCode: poSite.site.code,
            isAssigned,
            poId: po.id,
            poNumber: po.poNumber || po.soNumber || po.loiNumber || po.id.substring(0, 8),
            assignedTo: isAssigned ? {
              id: poSiteModule.assignments[0].projectManager.id,
              name: `${poSiteModule.assignments[0].projectManager.firstName} ${poSiteModule.assignments[0].projectManager.lastName}`
            } : null
          })
        }
      }
    }
    
    return NextResponse.json(siteModules)
  } catch (error) {
    console.error('Error fetching PO site modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site modules' },
      { status: 500 }
    )
  }
} 