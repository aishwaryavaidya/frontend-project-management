import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'

// GET /api/users - Get users, optionally filtered by role
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    
    const users = await prisma.user.findMany({
      where: {
        role: role ? role as any : undefined
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeId: true,
        role: true
      },
      orderBy: {
        firstName: 'asc'
      }
    })
    
    // For development, if no project managers are found, return mock data
    if (role === 'PROJECT_MANAGER' && users.length === 0) {
      return NextResponse.json([
        {
          id: 'pm-123',
          firstName: 'Project',
          lastName: 'Manager',
          email: 'pm@example.com',
          employeeId: 'PM001',
          role: 'PROJECT_MANAGER'
        },
        {
          id: 'pm-456',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          employeeId: 'PM002',
          role: 'PROJECT_MANAGER'
        },
        {
          id: 'pm-789',
          firstName: 'Viswajeet',
          lastName: 'Ray',
          email: 'viswajt2408@gmail.com',
          employeeId: 'PM003',
          role: 'PROJECT_MANAGER'
        }
      ])
    }
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
} 