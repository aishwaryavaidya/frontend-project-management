import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/modules - Get all modules
export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    
    return NextResponse.json(modules)
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    )
  }
}

// POST /api/modules - Create a new module
export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Module name is required' },
        { status: 400 }
      )
    }
    
    // Check if module already exists
    const existingModule = await prisma.module.findFirst({
      where: {
        name
      }
    })
    
    if (existingModule) {
      return NextResponse.json(
        { error: 'Module with this name already exists' },
        { status: 400 }
      )
    }
    
    const module = await prisma.module.create({
      data: {
        name
      }
    })
    
    return NextResponse.json(module, { status: 201 })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    )
  }
} 