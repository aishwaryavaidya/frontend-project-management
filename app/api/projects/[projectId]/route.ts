// app/api/projects/[projectId]/routeModule.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/config/auth'

const handleError = (message: string, status = 500) => {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params

    const project = await prisma.pMProject.findUnique({
      where: {
        id: projectId
      },
      include: {
        projectManager: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        modules: {
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
            }
          }
        },
        projectPlan: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}