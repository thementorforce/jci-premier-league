import { NextResponse } from 'next/server';
import { readConfig } from '@/lib/config';

export const revalidate = 0;

export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json({ auctionStatus: config.auctionStatus || 'NOT_STARTED' });
  } catch (error) {
    console.error('Error fetching auction status-lite:', error);
    return NextResponse.json({ auctionStatus: 'NOT_STARTED' });
  }
}
