// app/api/projects/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// Helper function for error responses
const handleError = (message: string, status = 500) => {
  return NextResponse.json({ error: message }, { status })
}
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { raidItems: true }
    })
    return NextResponse.json(projects)
  } catch (error) {
    return handleError('Failed to fetch projects')
  }
}
export async function POST(req: Request) {
  try {
    const { name, description } = await req.json()
    
    // Validate required fields
    if (!name?.trim()) {
      return handleError('Project name is required', 400)
    }
    const project = await prisma.project.create({
      data: { name, description }
    })
    return NextResponse.json(project)
  } catch (error) {
    return handleError('Failed to create project')
  }
}