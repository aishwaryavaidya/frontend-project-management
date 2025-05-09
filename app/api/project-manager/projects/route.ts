import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PMProject } from '@prisma/client'

// Helper type for site data within metadata or derived from modules
type SiteInfo = {
  id: string;
  name: string;
  code: string;
  modules: Array<{
    id: string;
    name: string;
    poSiteModuleId?: string; // Include if derived from modules
  }>;
};

// GET /api/project-manager/projects - Get all projects for the current project manager
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const projects = await prisma.pMProject.findMany({
      where: { projectManagerId: userId },
      include: {
        modules: { // Include project modules to derive site/module info if metadata is missing
          include: {
            poSiteModule: {
              include: {
                module: { select: { id: true, name: true } },
                poSite: {
                  include: {
                    site: { select: { id: true, name: true, code: true } },
                  }
                }
              }
            }
          }
        },
        projectPlan: { // Check if a plan exists
          select: { id: true }
        }
      } as any, // Use 'as any' to bypass strict type check for include
      orderBy: { createdAt: 'desc' }
    })

    // Format the response, prioritizing metadata but falling back to module data
    const formattedProjects = projects.map((project: any) => { // Use 'any' here to handle potential metadata/projectPlan type issues
      let sites: SiteInfo[] = [];
      
      // Attempt to parse metadata
      try {
        if (project.metadata) {
          const metadata = typeof project.metadata === 'string' ? JSON.parse(project.metadata) : project.metadata;
          if (metadata?.sites && Array.isArray(metadata.sites)) {
            // Basic validation of metadata structure
            sites = metadata.sites.filter((s: any) => s && s.id && s.name && s.code && Array.isArray(s.modules))
                               .map((s: any) => ({ 
                                 id: s.id, 
                                 name: s.name, 
                                 code: s.code, 
                                 modules: s.modules.filter((m: any) => m && m.id && m.name)
                                                .map((m: any) => ({ id: m.id, name: m.name }))
                               })) as SiteInfo[];
          }
        }
      } catch (e) {
        console.error(`Error parsing metadata for project ${project.id}:`, e);
        // Metadata failed, we will rely on modules below
      }

      // If metadata parsing failed or metadata was empty, derive from project modules
      if (sites.length === 0 && project.modules && project.modules.length > 0) {
        const siteMap = new Map<string, SiteInfo>();
        project.modules.forEach((pm: any) => {
          if (pm.poSiteModule?.poSite?.site && pm.poSiteModule?.module) {
            const siteData = pm.poSiteModule.poSite.site;
            const moduleData = pm.poSiteModule.module;
            const poSiteModuleId = pm.poSiteModule.id;

            if (!siteMap.has(siteData.id)) {
              siteMap.set(siteData.id, {
                id: siteData.id,
                name: siteData.name,
                code: siteData.code,
                modules: []
              });
            }
            siteMap.get(siteData.id)?.modules.push({
              id: moduleData.id,
              name: moduleData.name,
              poSiteModuleId: poSiteModuleId // Store this for reference if needed
            });
          }
        });
        sites = Array.from(siteMap.values());
      }

      return {
        id: project.id,
        name: project.name,
        code: project.code,
        createdAt: project.createdAt.toISOString(),
        sites: sites,
        projectPlan: project.projectPlan ? { id: project.projectPlan.id } : null
      };
    });

    return new NextResponse(JSON.stringify(formattedProjects), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching projects:', error)
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to fetch projects', 
      details: String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// POST /api/project-manager/projects - Create a new project
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const userId = session.user.id

    let body;
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Invalid JSON in request body:', parseError)
      return new NextResponse(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { name, code, poSiteModuleIds, sites: sitesFromRequest } = body

    console.log("Received project creation request:", { name, code, count: poSiteModuleIds?.length });

    // --- Validation --- 
    if (!name) return new NextResponse(JSON.stringify({ error: 'Project name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!code) return new NextResponse(JSON.stringify({ error: 'Project code is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!poSiteModuleIds || !Array.isArray(poSiteModuleIds) || poSiteModuleIds.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'At least one module (poSiteModuleId) is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Basic validation of IDs
    if (poSiteModuleIds.some((id: any) => typeof id !== 'string' || !id)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid poSiteModuleIds provided.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // --- Check Project Code Uniqueness ---
    const existingProject = await prisma.pMProject.findUnique({ where: { code } })
    if (existingProject) {
      return new NextResponse(JSON.stringify({ error: `Project code "${code}" already exists` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // --- Verify Module Assignments and Availability ---
    // Fetch assignments for the given poSiteModuleIds to ensure they belong to this PM
    const assignments = await prisma.assignment.findMany({
      where: {
        projectManagerId: userId,
        poSiteModuleId: { in: poSiteModuleIds }
      },
      select: { poSiteModuleId: true }
    });
    const assignedIds = new Set(assignments.map(a => a.poSiteModuleId));
    const missingAssignmentIds = poSiteModuleIds.filter((id: string) => !assignedIds.has(id));
    if (missingAssignmentIds.length > 0) {
      return new NextResponse(JSON.stringify({ 
        error: `Modules not assigned to you: ${missingAssignmentIds.join(', ')}`,
        missingModuleIds: missingAssignmentIds 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if any of these modules are already in another project
    const existingProjectModules = await prisma.projectModule.findMany({
      where: {
        poSiteModuleId: { in: poSiteModuleIds }
      },
      select: { poSiteModuleId: true }
    });
    if (existingProjectModules.length > 0) {
      const alreadyInProjectIds = existingProjectModules.map(pm => pm.poSiteModuleId);
      return new NextResponse(JSON.stringify({ 
        error: `Modules already in another project: ${alreadyInProjectIds.join(', ')}`,
        conflictingModuleIds: alreadyInProjectIds
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // --- Transaction: Create Project and Project Modules --- 
    let newProject: PMProject | null = null; // Initialize explicitly to null
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Create the project
        // Assign the created project to the outer scope variable
        newProject = await tx.pMProject.create({
          data: {
            name,
            code,
            projectManagerId: userId,
            // Store the provided site structure in metadata for portfolio display
            metadata: sitesFromRequest && Array.isArray(sitesFromRequest) ? { sites: sitesFromRequest } : null 
          } as any // Use 'as any' to bypass strict type check for create data
        })
        
        console.log(`Created project ${newProject.id} (${newProject.code})`);

        // Create project modules links
        const moduleCreationPromises = poSiteModuleIds.map((poSiteModuleId: string) => 
          tx.projectModule.create({
            data: {
              projectId: newProject!.id, // Use non-null assertion as it's defined above
              poSiteModuleId: poSiteModuleId
            }
          })
        );
        
        await Promise.all(moduleCreationPromises);
        console.log(`Linked ${poSiteModuleIds.length} modules to project ${newProject.id}`);

        return newProject; // Return the created project
      });

      if (!result) { // Should not happen if transaction succeeded, but good practice
        throw new Error('Transaction completed but project data was not returned.')
      }

      // --- Format and Return Success Response --- 
      const formattedProject = {
        id: result.id,
        name: result.name,
        code: result.code,
        createdAt: result.createdAt.toISOString(),
        sites: sitesFromRequest || [], // Return the structure used for creation
        // modules: ... could fetch modules again if needed, but sites is likely sufficient
        success: true,
        message: `Project "${result.name}" created successfully with ${poSiteModuleIds.length} modules.`,
        nextStep: 'projectPlan',
        projectPlanUrl: `/dashboard/project-plan/${result.id}`
      };

      return new NextResponse(JSON.stringify(formattedProject), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error during project creation transaction:', error);
      // Note: Transaction automatically rolls back on error

      // Attempt to clean up the project record if it exists (and wasn't rolled back)
      // Cast to any to bypass persistent 'never' type inference issue in catch block
      const projectIdToCleanup = (newProject as any)?.id; 

      if (projectIdToCleanup) { 
         try { 
           console.warn(`Transaction failed. Attempting cleanup of project ${projectIdToCleanup}`);
           await prisma.pMProject.delete({ where: { id: projectIdToCleanup } });
           console.log(`Successfully cleaned up project ${projectIdToCleanup}`);
         } catch (cleanupError) { 
           // Log the cleanup error, but don't let it mask the original error
           console.error(`Failed to cleanup project ${projectIdToCleanup}:`, cleanupError); 
         }
      }

      const errorMessage = error instanceof Error ? error.message : 'Database transaction failed';
      // Ensure we always return a valid JSON response
      return new NextResponse(JSON.stringify({ error: `Failed to create project: ${errorMessage}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) { // Outermost catch
    console.error('Error in POST /projects:', error);

    // Construct a safe error message
    let safeErrorMessage = 'Failed to create project due to an unexpected error';
    if (error instanceof Error) {
        safeErrorMessage = `Failed to create project: ${error.message}`;
    } else if (typeof error === 'string') {
        safeErrorMessage = `Failed to create project: ${error}`;
    } else {
      // Fallback for unknown error types
      safeErrorMessage = 'An unknown error occurred during project creation.';
    }
    
    // Return a simplified error response - ensure we never pass null as payload
    return new NextResponse(JSON.stringify({ error: safeErrorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
 