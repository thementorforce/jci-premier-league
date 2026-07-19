import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const teams = await prisma.team.findMany({
      orderBy: { name: 'asc' },
      include: {
        players: true,
      }
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { name, ownerName, pointsPurse } = await request.json();

    if (!name || !ownerName) {
      return NextResponse.json({ error: 'Team name and owner name are required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedOwnerName = ownerName.trim();
    const purseVal = parseInt(pointsPurse, 10);
    const purse = isNaN(purseVal) || purseVal <= 0 ? 100000 : purseVal;

    // Check if team name already exists
    const existingTeam = await prisma.team.findUnique({
      where: { name: trimmedName }
    });

    if (existingTeam) {
      return NextResponse.json({ error: 'A team with this name already exists' }, { status: 400 });
    }

    // Create team
    const team = await prisma.team.create({
      data: {
        name: trimmedName,
        ownerName: trimmedOwnerName,
        pointsPurse: purse,
        pointsSpent: 0,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Team created successfully',
      team,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating team:', error);
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
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id },
      include: { players: true }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if team has drafted players
    if (team.players.length > 0) {
      return NextResponse.json({ error: 'Cannot delete a team that already has drafted players' }, { status: 400 });
    }

    // Delete team (bids cascade, no linked user to remove)
    await prisma.team.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
