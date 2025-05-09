import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/customers - Get all customers
export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: Request) {
  try {
    const { name, vertical } = await request.json()
    
    // Validate required fields
    if (!name || !vertical) {
      return NextResponse.json(
        { error: 'Name and vertical are required' },
        { status: 400 }
      )
    }
    
    const customer = await prisma.customer.create({
      data: {
        name,
        vertical
      }
    })
    
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
} 