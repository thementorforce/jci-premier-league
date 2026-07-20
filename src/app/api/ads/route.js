import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Public endpoint — returns only active ads, no auth required
export async function GET() {
  try {
    const ads = await prisma.adPlacement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(ads);
  } catch (error) {
    console.error('Error fetching public ads:', error);
    return NextResponse.json([], { status: 200 });
  }
}
