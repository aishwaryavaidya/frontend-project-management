import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/customers/[customerId]/sites - Get all sites for a customer
export async function GET(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params
    
    const sites = await prisma.site.findMany({
      where: {
        customerId
      },
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(sites)
  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 }
    )
  }
}

// POST /api/customers/[customerId]/sites - Create a new site for a customer
export async function POST(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params
    const { name, code } = await request.json()
    
    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
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
    
    // Check if site code already exists for this customer
    const existingSite = await prisma.site.findFirst({
      where: {
        customerId,
        code
      }
    })
    
    if (existingSite) {
      return NextResponse.json(
        { error: 'Site code already exists for this customer' },
        { status: 400 }
      )
    }
    
    const site = await prisma.site.create({
      data: {
        name,
        code,
        customerId
      }
    })
    
    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    )
  }
} 