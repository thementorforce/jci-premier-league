import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Public endpoint — returns only active ads, optionally filtered by page
// Usage: /api/ads?page=matches
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page'); // e.g. "matches", "standings", "stats", "teams"

    const ads = await prisma.adPlacement.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    // Filter by page if specified
    const filtered = page
      ? ads.filter(ad => {
          if (!ad.position) return false;
          const pages = ad.position.split(',').map(p => p.trim().toLowerCase());
          return pages.includes('all') || pages.includes(page.toLowerCase());
        })
      : ads;

    return NextResponse.json(filtered, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error fetching public ads:', error);
    return NextResponse.json([], { status: 200 });
  }
}
