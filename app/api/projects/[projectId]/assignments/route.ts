import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/db';

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const projectId = params.projectId;
    
    // Verify the project exists and belongs to the current user
    const project = await prisma.pMProject.findUnique({
      where: {
        id: projectId,
        projectManagerId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or not authorized' },
        { status: 404 }
      );
    }

    // Get all modules for this project
    const projectModules = await prisma.projectModule.findMany({
      where: {
        projectId,
      },
      include: {
        poSiteModule: {
          include: {
            module: true,
            poSite: {
              include: {
                site: true,
              },
            },
          },
        },
      },
    });

    // Get assignments for these modules
    const assignments = await prisma.assignment.findMany({
      where: {
        poSiteModuleId: {
          in: projectModules.map(pm => pm.poSiteModuleId),
        },
      },
      include: {
        poSiteModule: {
          include: {
            module: true,
            poSite: {
              include: {
                site: true,
              },
            },
          },
        },
        Employee: true,
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching project assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST endpoint to assign resources to project modules
export async function POST(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const projectId = params.projectId;
    const { employeeId, poSiteModuleId } = await request.json();
    
    // Validate required fields
    if (!employeeId || !poSiteModuleId) {
      return NextResponse.json(
        { error: 'Employee ID and module ID are required' },
        { status: 400 }
      );
    }
    
    // Verify the project and module exist and belong to the current user
    const projectModule = await prisma.projectModule.findFirst({
      where: {
        projectId,
        poSiteModuleId,
        project: {
          projectManagerId: session.user.id,
        },
      },
    });

    if (!projectModule) {
      return NextResponse.json(
        { error: 'Project module not found or not authorized' },
        { status: 404 }
      );
    }

    // Create the assignment
    const assignment = await prisma.assignment.create({
      data: {
        poSiteModuleId,
        projectManagerId: session.user.id,
        employeeId: parseInt(employeeId),
      },
      include: {
        poSiteModule: {
          include: {
            module: true,
            poSite: {
              include: {
                site: true,
              },
            },
          },
        },
        Employee: true,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
} 