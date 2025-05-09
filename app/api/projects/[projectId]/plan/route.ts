import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/db';

// GET /api/projects/[projectId]/plan - Get project plan
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
    
    // Find the project plan directly
    const projectPlan = await prisma.projectPlan.findUnique({
      where: {
        projectId: projectId,
      },
    });

    if (!projectPlan) {
      return NextResponse.json(
        { message: 'No project plan exists for this project' },
        { status: 200 }
      );
    }

    // Verify the project belongs to the user
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

    return NextResponse.json(projectPlan);
  } catch (error) {
    console.error('Error fetching project plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project plan' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[projectId]/plan - Create project plan
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
    
    // Check if project exists and belongs to the user
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

    // Check if plan already exists
    const existingPlan = await prisma.projectPlan.findUnique({
      where: {
        projectId: projectId,
      },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Project plan already exists', id: existingPlan.id },
        { status: 400 }
      );
    }

    // Create new project plan
    const plan = await prisma.projectPlan.create({
      data: {
        projectId,
      },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating project plan:', error);
    return NextResponse.json(
      { error: 'Failed to create project plan' },
      { status: 500 }
    );
  }
} 