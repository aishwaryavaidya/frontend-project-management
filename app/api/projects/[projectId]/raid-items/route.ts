// app/api/projects/[projectId]/raid-items/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'
const handleError = (message: string, status = 500) => {
  return NextResponse.json({ error: message }, { status })
}
// Helper function to safely parse JSON
const safeJSONParse = (str: string | null) => {
  try {
    return str ? JSON.parse(str) : []
  } catch {
    return []
  }
}
export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const raidItems = await prisma.rAIDItem.findMany({
      where: { projectId: params.projectId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(raidItems.map(item => ({
      ...item,
      mitigationPlan: safeJSONParse(item.mitigationPlan as string),
      activitiesLog: safeJSONParse(item.activitiesLog as string),
      actionItems: safeJSONParse(item.actionItems as string),
      remarks: safeJSONParse(item.remarks as string)
    })))
  } catch (error) {
    return handleError('Failed to fetch RAID items')
  }
}
export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.category?.trim()) {
      return handleError('Category is required', 400)
    }
    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: params.projectId }
    })
    if (!project) {
      return handleError('Project not found', 404)
    }
    const newItem = await prisma.rAIDItem.create({
      data: {
        projectId: params.projectId,
        category: body.category,
        mitigationPlan: JSON.stringify(body.mitigationPlan || []),
        activitiesLog: JSON.stringify(body.activitiesLog || []),
        actionItems: JSON.stringify(body.actionItems || []),
        remarks: JSON.stringify(body.remarks || []),
        status: body.status || 'open',
        type: body.type || '',
        impact: body.impact || '',
        priority: body.priority || 'Medium',
        probability: body.probability || 0,
        preventiveAction: body.preventiveAction || '',
        owner: body.owner || '',
        confirmedBy: body.confirmedBy || '',
        confirmationDate: new Date,
        assignedTo: body.assignedTo || '',
        assignedOn: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    return NextResponse.json({
      ...newItem,
      mitigationPlan: safeJSONParse(newItem.mitigationPlan as string),
      activitiesLog: safeJSONParse(newItem.activitiesLog as string),
      actionItems: safeJSONParse(newItem.actionItems as string),
      remarks: safeJSONParse(newItem.remarks as string)
    })
  } catch (error) {
    console.error('Error creating RAID item:', error)
    return handleError('Failed to create RAID item')
  }
}