// app/api/projects/[projectId]/raid-items/[id]/route.ts

import { NextResponse } from 'next/server'
import {prisma} from '@/prisma/db'
import type { RAIDItem } from '@/types/raid'

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body: Partial<RAIDItem> = await req.json()
    
    const updatedItem = await prisma.rAIDItem.update({
      where: { id: params.id },
      data: {
        mitigationPlan: body.mitigationPlan ? JSON.stringify(body.mitigationPlan) : undefined,
        activitiesLog: body.activitiesLog ? JSON.stringify(body.activitiesLog) : undefined,
        actionItems: body.actionItems ? JSON.stringify(body.actionItems) : undefined,
        remarks: body.remarks ? JSON.stringify(body.remarks) : undefined,
        ...body
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update RAID item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    await prisma.rAIDItem.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete RAID item' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await req.json();
    const updatedItem = await prisma.rAIDItem.update({
      where: { id: params.id },
      data: {
        // Only update the fields provided in the request
        ...body,
        // Handle date fields conversion
        ...(body.mitigationPlan && {
          mitigationPlan: {
            set: body.mitigationPlan.map((step: any) => ({
              ...step,
              date: new Date(step.date)
            }))
          }
        })
      }
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}