// app/api/projects/[projectId]/raid-items/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/db";
import type { RAIDItem } from "@/types/raid";

// Helper function to safely parse JSON fields stored as strings
const safeJSONParse = (str: string | null) => {
  try {
    return str ? JSON.parse(str) : [];
  } catch {
    return [];
  }
};

export async function PUT(
  req: Request,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body: Partial<RAIDItem> = await req.json();

    // For fields stored as JSON strings, stringify the value if provided.
    const updatedItem = await prisma.rAIDItem.update({
      where: { id: params.id },
      data: {
        mitigationPlan: body.mitigationPlan
          ? JSON.stringify(body.mitigationPlan)
          : undefined,
        activitiesLog: body.activitiesLog
          ? JSON.stringify(body.activitiesLog)
          : undefined,
        actionItems: body.actionItems
          ? JSON.stringify(body.actionItems)
          : undefined,
        remarks: body.remarks ? JSON.stringify(body.remarks) : undefined,
        ...body,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      ...updatedItem,
      mitigationPlan: safeJSONParse(updatedItem.mitigationPlan as string),
      activitiesLog: safeJSONParse(updatedItem.activitiesLog as string),
      actionItems: safeJSONParse(updatedItem.actionItems as string),
      remarks: safeJSONParse(updatedItem.remarks as string)
    });
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { error: "Failed to update RAID item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    await prisma.rAIDItem.delete({
      where: { id: params.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE:", error);
    return NextResponse.json(
      { error: "Failed to delete RAID item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string; id: string } }
) {
  try {
    const body = await req.json();

    // Build an update object and handle JSON fields properly.
    const data: any = { ...body };

    if (body.mitigationPlan !== undefined) {
      data.mitigationPlan = JSON.stringify(
        Array.isArray(body.mitigationPlan)
          ? body.mitigationPlan.map((step: any) => ({
              ...step,
              date: new Date(step.date)
            }))
          : []
      );
    }
    if (body.activitiesLog !== undefined) {
      data.activitiesLog = JSON.stringify(body.activitiesLog);
    }
    if (body.actionItems !== undefined) {
      data.actionItems = JSON.stringify(body.actionItems);
    }
    if (body.remarks !== undefined) {
      data.remarks = JSON.stringify(body.remarks);
    }

    // Always update the updatedAt field
    data.updatedAt = new Date();

    const updatedItem = await prisma.rAIDItem.update({
      where: { id: params.id },
      data
    });

    return NextResponse.json({
      ...updatedItem,
      mitigationPlan: safeJSONParse(updatedItem.mitigationPlan as string),
      activitiesLog: safeJSONParse(updatedItem.activitiesLog as string),
      actionItems: safeJSONParse(updatedItem.actionItems as string),
      remarks: safeJSONParse(updatedItem.remarks as string)
    });
  } catch (error) {
    console.error("Error in PATCH:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
