import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/db';

export async function GET() {
  const tasks = await prisma.task.findMany({ orderBy: { siNo: 'asc' } });
  return NextResponse.json(tasks, { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' } });
}