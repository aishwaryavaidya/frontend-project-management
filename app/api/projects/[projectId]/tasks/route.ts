import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/config/auth';
import { Prisma } from '@prisma/client';

// GET /api/projects/:projectId/tasks
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;

    // First, verify that the project exists
    const project = await prisma.pMProject.findUnique({
      where: {
        id: projectId,
      },
      include: {
        projectPlan: true,
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // If project plan doesn't exist yet, return empty array
    if (!project.projectPlan) {
      return NextResponse.json([]);
    }

    // Fetch tasks for the project plan
    const tasks = await prisma.planTask.findMany({
      where: {
        projectPlanId: project.projectPlan.id,
        isDeleted: false,
      },
      orderBy: {
        siNo: 'asc',
      },
      include: {
        remarks: true,
        stage: true,
        product: true,
      }
    });

    // Transform the dates from strings to Date objects for the client
    const transformedTasks = tasks.map((task) => ({
      ...task,
      startDate: task.startDate ? new Date(task.startDate) : null,
      endDate: task.endDate ? new Date(task.endDate) : null,
      actualStartDate: task.actualStartDate ? new Date(task.actualStartDate) : null,
      actualEndDate: task.actualEndDate ? new Date(task.actualEndDate) : null,
      plannedEndDate: task.plannedEndDate ? new Date(task.plannedEndDate) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      remarks: task.remarks.map((remark) => ({
        ...remark,
        date: new Date(remark.date),
        responseTimestamp: remark.responseTimestamp ? new Date(remark.responseTimestamp) : null,
        createdAt: new Date(remark.createdAt),
        updatedAt: new Date(remark.updatedAt),
      })),
    }));

    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/projects/:projectId/tasks
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = params;
    const taskData = await request.json();

    // Verify that the project exists
    const project = await prisma.pMProject.findUnique({
      where: {
        id: projectId,
      },
      include: {
        projectPlan: true,
      }
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create project plan if it doesn't exist
    let projectPlanId = project.projectPlan?.id;
    
    if (!projectPlanId) {
      const newProjectPlan = await prisma.projectPlan.create({
        data: {
          projectId: project.id,
        }
      });
      projectPlanId = newProjectPlan.id;
    }

    // Create the new task
    const newTask = await prisma.planTask.create({
      data: {
        siNo: taskData.siNo,
        wbsNo: taskData.wbsNo,
        taskName: taskData.taskName,
        predecessorIds: taskData.predecessorIds,
        level: taskData.level || 0,
        goLive: taskData.goLive || false,
        financialMilestone: taskData.financialMilestone || false,
        startDate: taskData.startDate ? new Date(taskData.startDate) : null,
        endDate: taskData.endDate ? new Date(taskData.endDate) : null,
        duration: taskData.duration,
        actualStartDate: taskData.actualStartDate ? new Date(taskData.actualStartDate) : null,
        actualEndDate: taskData.actualEndDate ? new Date(taskData.actualEndDate) : null,
        actualDuration: taskData.actualDuration,
        progress: taskData.progress || 0,
        view: taskData.view || 'External',
        stageId: taskData.stageId,
        productId: taskData.productId,
        isParent: taskData.isParent || false,
        financialValue: taskData.financialValue,
        plannedEndDate: taskData.plannedEndDate ? new Date(taskData.plannedEndDate) : null,
        delayDays: taskData.delayDays,
        projectPlanId: projectPlanId,
      }
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 