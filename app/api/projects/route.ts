// app/api/projects/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/prisma/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    // Forward this request to the project-manager projects endpoint
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the request body
    const body = await req.json()
    console.log("Received project creation request in /api/projects:", body)
    
    // Make a request to the project manager API
    const pmApiUrl = new URL(req.url)
    pmApiUrl.pathname = '/api/project-manager/projects'
    
    const response = await fetch(pmApiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || '' // Forward cookies for auth
      },
      body: JSON.stringify(body)
    })
    
    // Get the response from the project manager API
    const responseData = await response.json()
    
    if (!response.ok) {
      console.error("Error from project manager API:", responseData)
      return NextResponse.json(
        { error: responseData.error || 'Failed to create project' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(responseData, { status: response.status })
  } catch (error) {
    console.error('Error in projects POST:', error)
    return handleError('Failed to process project creation request')
  }
}