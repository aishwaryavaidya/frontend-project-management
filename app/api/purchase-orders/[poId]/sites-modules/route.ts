import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// POST /api/purchase-orders/[poId]/sites-modules - Update sites and modules for a purchase order
export async function POST(
  request: Request,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params
    const { sites } = await request.json()
    
    if (!Array.isArray(sites) || sites.length === 0) {
      return NextResponse.json(
        { error: 'Sites data is required' },
        { status: 400 }
      )
    }
    
    // Check if purchase order exists
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: poId
      }
    })
    
    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }
    
    // Process sites and modules in a transaction
    await prisma.$transaction(async (tx) => {
      // Get existing PO_Sites
      const existingPOSites = await tx.pO_Site.findMany({
        where: {
          poId
        },
        include: {
          poSiteModules: true
        }
      })
      
      // Delete sites and modules that are no longer in the list
      const newSiteIds = sites.map(site => site.siteId)
      
      // Delete PO_Site_Modules for sites not in the new list
      for (const poSite of existingPOSites) {
        if (!newSiteIds.includes(poSite.siteId)) {
          // Delete all modules for this site
          if (poSite.poSiteModules.length > 0) {
            await tx.pO_Site_Module.deleteMany({
              where: {
                poSiteId: poSite.id
              }
            })
          }
          
          // Delete the PO_Site
          await tx.pO_Site.delete({
            where: {
              id: poSite.id
            }
          })
        }
      }
      
      // Process each site
      for (const site of sites) {
        const { siteId, modules } = site
        
        // Find or create PO_Site
        let poSite = existingPOSites.find(ps => ps.siteId === siteId)
        
        if (!poSite) {
          poSite = await tx.pO_Site.create({
            data: {
              poId,
              siteId
            }
          })
        }
        
        // Get existing modules for this PO_Site
        const existingModules = poSite.poSiteModules || []
        const newModuleIds = modules.map(module => module.id)
        
        // Delete modules that are not in the new list
        for (const poSiteModule of existingModules) {
          const moduleExists = newModuleIds.includes(poSiteModule.moduleId)
          
          if (!moduleExists) {
            await tx.pO_Site_Module.delete({
              where: {
                id: poSiteModule.id
              }
            })
          }
        }
        
        // Add new modules
        for (const module of modules) {
          const moduleExists = existingModules.some(m => m.moduleId === module.id)
          
          if (!moduleExists) {
            await tx.pO_Site_Module.create({
              data: {
                poSiteId: poSite.id,
                moduleId: module.id
              }
            })
          }
        }
      }
    })
    
    return NextResponse.json({ message: 'Sites and modules updated successfully' })
  } catch (error) {
    console.error('Error updating sites and modules:', error)
    return NextResponse.json(
      { error: 'Failed to update sites and modules' },
      { status: 500 }
    )
  }
} 