import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const ads = await prisma.adPlacement.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(ads);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { title, imageUrl, targetUrl, position, contact, sponsorType } = await request.json();

    if (!title || !imageUrl || !position) {
      return NextResponse.json({ error: 'Title, image URL, and position are required' }, { status: 400 });
    }

    if (!contact) {
      return NextResponse.json({ error: 'Sponsor contact detail is required' }, { status: 400 });
    }

    const newAd = await prisma.adPlacement.create({
      data: {
        title,
        imageUrl,
        targetUrl: targetUrl || '#',
        position,
        contact: contact.trim(),
        sponsorType: sponsorType || 'General',
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
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

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

export async function PATCH(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { id, active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    const updated = await prisma.adPlacement.update({
      where: { id },
      data: { active: Boolean(active) },
    });

    return NextResponse.json({ success: true, ad: updated });
  } catch (error) {
    console.error('Error updating advertisement:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
