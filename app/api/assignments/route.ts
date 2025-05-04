import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/assignments - Get all assignments
export async function GET() {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        poSiteModule: {
          include: {
            module: true,
            poSite: {
              include: {
                site: true
              }
            }
          }
        },
        projectManager: true
      }
    })
    
    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

// POST /api/assignments - Create new assignments
export async function POST(request: Request) {
  try {
    const { projectManagerId, poSiteModuleIds } = await request.json()
    
    if (!projectManagerId || !poSiteModuleIds || !Array.isArray(poSiteModuleIds) || poSiteModuleIds.length === 0) {
      return NextResponse.json(
        { error: 'Project manager ID and module IDs are required' },
        { status: 400 }
      )
    }
    
    // Check if project manager exists
    const projectManager = await prisma.user.findUnique({
      where: {
        id: projectManagerId,
        role: 'PROJECT_MANAGER'
      }
    })
    
    if (!projectManager) {
      return NextResponse.json(
        { error: 'Project manager not found' },
        { status: 404 }
      )
    }
    
    // Check if all modules exist
    const poSiteModules = await prisma.pO_Site_Module.findMany({
      where: {
        id: {
          in: poSiteModuleIds
        }
      }
    })
    
    if (poSiteModules.length !== poSiteModuleIds.length) {
      return NextResponse.json(
        { error: 'One or more modules not found' },
        { status: 404 }
      )
    }
    
    // Check for existing assignments
    const existingAssignments = await prisma.assignment.findMany({
      where: {
        poSiteModuleId: {
          in: poSiteModuleIds
        }
      }
    })
    
    if (existingAssignments.length > 0) {
      return NextResponse.json(
        { error: 'One or more modules are already assigned' },
        { status: 400 }
      )
    }
    
    // Create assignments in a transaction
    const assignments = await prisma.$transaction(
      poSiteModuleIds.map(poSiteModuleId => 
        prisma.assignment.create({
          data: {
            poSiteModuleId,
            projectManagerId
          }
        })
      )
    )
    
    return NextResponse.json(assignments, { status: 201 })
  } catch (error) {
    console.error('Error creating assignments:', error)
    return NextResponse.json(
      { error: 'Failed to create assignments' },
      { status: 500 }
    )
  }
} 