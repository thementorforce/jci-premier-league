import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const player = await prisma.playerProfile.findUnique({
      where: { id },
      select: { paymentScreenshot: true }
    });

    if (!player || !player.paymentScreenshot) {
      return new NextResponse(null, { status: 404 });
    }

    const matches = player.paymentScreenshot.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.redirect(player.paymentScreenshot);
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
    console.error('Error serving payment screenshot:', error);
    return new NextResponse(null, { status: 500 });
  }
}
