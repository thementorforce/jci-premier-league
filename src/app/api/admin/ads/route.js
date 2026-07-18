import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const ads = await prisma.adPlacement.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, imageUrl, targetUrl, position } = await request.json();

    if (!title || !imageUrl || !position) {
      return NextResponse.json({ error: 'Title, image URL, and position are required' }, { status: 400 });
    }

    const newAd = await prisma.adPlacement.create({
      data: {
        title,
        imageUrl,
        targetUrl: targetUrl || '#',
        position,
        active: true
      }
    });

    return NextResponse.json({ success: true, ad: newAd }, { status: 201 });
  } catch (error) {
    console.error('Error creating advertisement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    await prisma.adPlacement.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
