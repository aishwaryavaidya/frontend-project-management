import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/purchase-orders/[poId] - Get a purchase order by ID
export async function GET(
  request: Request,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params
    
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: {
        id: poId
      }
    })
    
    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(purchaseOrder)
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
      { status: 500 }
    )
  }
}

// PUT /api/purchase-orders/[poId] - Update a purchase order
export async function PUT(
  request: Request,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params
    const data = await request.json()
    const {
      poNumber,
      soNumber,
      loiNumber,
      issueDate,
      expiryDate,
      amount,
      description
    } = data
    
    // Validate required fields
    if (!issueDate || !expiryDate || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if purchase order exists
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: {
        id: poId
      }
    })
    
    if (!existingPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }
    
    // Check if PO number already exists for this customer (if changed)
    if (poNumber && poNumber !== existingPO.poNumber) {
      const duplicatePO = await prisma.purchaseOrder.findFirst({
        where: {
          customerId: existingPO.customerId,
          poNumber,
          id: { not: poId }
        }
      })
      
      if (duplicatePO) {
        return NextResponse.json(
          { error: 'Purchase order with this PO number already exists for this customer' },
          { status: 400 }
        )
      }
    }
    
    const updatedPurchaseOrder = await prisma.purchaseOrder.update({
      where: {
        id: poId
      },
      data: {
        poNumber,
        soNumber,
        loiNumber,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        amount: parseFloat(amount.toString()),
        description
      }
    })
    
    return NextResponse.json(updatedPurchaseOrder)
  } catch (error) {
    console.error('Error updating purchase order:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
      { status: 500 }
    )
  }
}

// DELETE /api/purchase-orders/[poId] - Delete a purchase order
export async function DELETE(
  request: Request,
  { params }: { params: { poId: string } }
) {
  try {
    const { poId } = params
    
    // Check if purchase order exists
    const existingPO = await prisma.purchaseOrder.findUnique({
      where: {
        id: poId
      },
      include: {
        poSites: {
          include: {
            poSiteModules: true
          }
        }
      }
    })
    
    if (!existingPO) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }
    
    // Delete all related records
    await prisma.$transaction(async (tx) => {
      // Delete all PO_Site_Module records
      for (const poSite of existingPO.poSites) {
        if (poSite.poSiteModules.length > 0) {
          await tx.pO_Site_Module.deleteMany({
            where: {
              poSiteId: poSite.id
            }
          })
        }
      }
      
      // Delete all PO_Site records
      await tx.pO_Site.deleteMany({
        where: {
          poId
        }
      })
      
      // Delete the Purchase Order
      await tx.purchaseOrder.delete({
        where: {
          id: poId
        }
      })
    })
    
    return NextResponse.json({ message: 'Purchase order deleted successfully' })
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase order' },
      { status: 500 }
    )
  }
} 