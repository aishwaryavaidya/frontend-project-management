import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/purchase-orders/[poId]/sites - Get all sites and modules for a purchase order
export async function GET(
  request: Request,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params
    
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
    
    // Get all sites with modules for this PO
    const poSites = await prisma.pO_Site.findMany({
      where: {
        poId
      },
      include: {
        site: true,
        poSiteModules: {
          include: {
            module: true
          }
        }
      }
    })
    
    // Transform the data for frontend consumption
    const sitesWithModules = poSites.map(poSite => ({
      siteId: poSite.site.id,
      siteName: poSite.site.name,
      siteCode: poSite.site.code,
      modules: poSite.poSiteModules.map(psm => ({
        id: psm.module.id,
        name: psm.module.name
      }))
    }))
    
    return NextResponse.json(sitesWithModules)
  } catch (error) {
    console.error('Error fetching sites and modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sites and modules' },
      { status: 500 }
    )
  }
}

// POST /api/purchase-orders/[poId]/sites - Add, update, or remove sites and modules for a purchase order
export async function POST(
  request: Request,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params
    const requestBody = await request.json();
    
    console.log('API received request for PO:', poId);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    // Validate the input data
    if (!Array.isArray(requestBody)) {
      console.log('Error: Invalid request format. Not an array.');
      return NextResponse.json(
        { error: 'Invalid request format. Expected an array of site data.' },
        { status: 400 }
      );
    }
    
    // Check if purchase order exists
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: poId }
    });
    
    if (!purchaseOrder) {
      console.log(`Error: Purchase order not found with ID: ${poId}`);
      return NextResponse.json(
        { error: `Purchase order not found with ID: ${poId}` },
        { status: 404 }
      );
    }
    
    // Validate site data first before transaction
    for (const siteData of requestBody) {
      const { siteId, modules } = siteData;
      
      if (!siteId) {
        console.log('Error: Missing siteId in request');
        return NextResponse.json(
          { error: 'Missing siteId in request' },
          { status: 400 }
        );
      }
      
      if (!modules || !Array.isArray(modules)) {
        console.log(`Error: Invalid modules data for site: ${siteId}`);
        return NextResponse.json(
          { error: `Invalid modules data for site: ${siteId}` },
          { status: 400 }
        );
      }
      
      if (modules.length === 0) {
        console.log(`Error: Empty modules array for site: ${siteId}`);
        return NextResponse.json(
          { error: `Empty modules array for site: ${siteId}` },
          { status: 400 }
        );
      }
      
      // Check if site exists
      const site = await prisma.site.findUnique({ where: { id: siteId } });
      if (!site) {
        console.log(`Error: Site not found with ID: ${siteId}`);
        return NextResponse.json(
          { error: `Site not found with ID: ${siteId}` },
          { status: 404 }
        );
      }
      
      // Check if all modules exist
      for (const moduleId of modules) {
        const module = await prisma.module.findUnique({ where: { id: moduleId } });
        if (!module) {
          console.log(`Error: Module not found with ID: ${moduleId}`);
          return NextResponse.json(
            { error: `Module not found with ID: ${moduleId}` },
            { status: 404 }
          );
        }
      }
    }
    
    // Process sites and modules in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get existing PO_Sites
      const existingPOSites = await tx.pO_Site.findMany({
        where: { poId },
        include: {
          site: true,
          poSiteModules: {
            include: { module: true }
          }
        }
      });
      
      console.log(`Found ${existingPOSites.length} existing PO_Sites for PO: ${poId}`);
      
      // Keep track of updated PO_Sites
      const updatedPOSites = [];
      
      // Process each site in the request
      for (const siteData of requestBody) {
        const { siteId, modules } = siteData;
        console.log(`Processing site: ${siteId} with ${modules.length} modules`);
        
        // Find or create PO_Site
        let poSite = existingPOSites.find(ps => ps.siteId === siteId);
        
        if (!poSite) {
          console.log(`Creating new PO_Site for siteId: ${siteId}`);
          // Create new PO_Site
          poSite = await tx.pO_Site.create({
            data: {
              poId,
              siteId
            },
            include: {
              site: true,
              poSiteModules: {
                include: { module: true }
              }
            }
          });
        } else {
          console.log(`Found existing PO_Site for siteId: ${siteId}`);
        }
        
        // Delete existing modules for this PO_Site
        const deletedModules = await tx.pO_Site_Module.deleteMany({
          where: { poSiteId: poSite.id }
        });
        console.log(`Deleted ${deletedModules.count} existing modules for PO_Site: ${poSite.id}`);
        
        // Add new modules
        for (const moduleId of modules) {
          console.log(`Adding module ${moduleId} to PO_Site: ${poSite.id}`);
          try {
            await tx.pO_Site_Module.create({
              data: {
                poSiteId: poSite.id,
                moduleId
              }
            });
          } catch (moduleError) {
            console.error(`Error adding module ${moduleId} to PO_Site ${poSite.id}:`, moduleError);
            throw new Error(`Failed to add module with ID: ${moduleId} to site`);
          }
        }
        
        // Get the updated PO_Site with new modules
        const updatedPOSite = await tx.pO_Site.findUnique({
          where: { id: poSite.id },
          include: {
            site: true,
            poSiteModules: {
              include: { module: true }
            }
          }
        });
        
        if (updatedPOSite) {
          console.log(`Added ${updatedPOSite.poSiteModules.length} modules to PO_Site: ${poSite.id}`);
          updatedPOSites.push(updatedPOSite);
        }
      }
      
      // Don't delete sites not in the request since we're only updating one site at a time
      // This was causing issues when saving individual sites
      
      return updatedPOSites;
    });
    
    // Transform the data for frontend consumption
    const updatedSitesWithModules = result.map(poSite => ({
      siteId: poSite.site.id,
      siteName: poSite.site.name,
      siteCode: poSite.site.code,
      modules: poSite.poSiteModules.map(psm => ({
        id: psm.module.id,
        name: psm.module.name
      }))
    }));
    
    console.log('Successfully updated sites and modules');
    return NextResponse.json(updatedSitesWithModules);
  } catch (error) {
    console.error('Error updating sites and modules:', error);
    let errorMessage = 'Failed to update sites and modules';
    let stackTrace = '';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      stackTrace = error.stack || '';
    }
    
    console.error('Stack trace:', stackTrace);
    
    return NextResponse.json(
      { 
        error: errorMessage,
        stack: stackTrace,
        details: 'Check server logs for more information' 
      },
      { status: 500 }
    );
  }
} 