import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/purchase-orders - Get purchase orders filtered by customerId and orderType
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const orderType = searchParams.get('orderType')
    
    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }
    
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        customerId,
        orderType: orderType || undefined
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(purchaseOrders)
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    )
  }
}

// POST /api/purchase-orders - Create a new purchase order
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const {
      customerId,
      orderType,
      poNumber,
      soNumber,
      loiNumber,
      issueDate,
      expiryDate,
      amount,
      description
    } = data
    
    // Validate required fields
    if (!customerId || !orderType || !issueDate || !expiryDate || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId
      }
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    // Check if PO number already exists for this customer
    if (poNumber) {
      const existingPO = await prisma.purchaseOrder.findFirst({
        where: {
          customerId,
          poNumber
        }
      })
      
      if (existingPO) {
        return NextResponse.json(
          { error: 'Purchase order with this PO number already exists for this customer' },
          { status: 400 }
        )
      }
    }
    
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        customerId,
        orderType,
        poNumber,
        soNumber,
        loiNumber,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        amount: parseFloat(amount),
        description
      }
    })
    
    return NextResponse.json(purchaseOrder, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    )
  }
} 