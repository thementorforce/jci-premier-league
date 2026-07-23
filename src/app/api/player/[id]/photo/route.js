import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // We only select photoUrl to keep the query extremely fast
    const player = await prisma.playerProfile.findUnique({
      where: { id },
      select: { photoUrl: true }
    });

    if (!player || !player.photoUrl) {
      return new NextResponse(null, { status: 404 });
    }

    const matches = player.photoUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      // If it's not a base64 data URI (e.g. an external URL), we could redirect, but for this app it's always base64
      return NextResponse.redirect(player.photoUrl);
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving player photo:', error);
    return new NextResponse(null, { status: 500 });
  }
}
