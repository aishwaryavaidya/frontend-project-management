// app/api/projects/[projectId]/routeModule.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'
const handleError = (message: string, status = 500) => {
  return NextResponse.json({ error: message }, { status })
}
export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      include: { raidItems: true }
    })
    if (!project) {
      return handleError('Project not found', 404)
    }
    return NextResponse.json(project)
  } catch (error) {
    return handleError('Failed to fetch project')
  }
}