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
    const { name, ownerName, ownerContact, pointsPurse, logoUrl } = await request.json();

    if (!name || !ownerName) {
      return NextResponse.json({ error: 'Team name and owner name are required' }, { status: 400 });
    }

    if (!logoUrl) {
      return NextResponse.json({ error: 'Team logo is required' }, { status: 400 });
    }

    const trimmedName = name.trim();
    const trimmedOwnerName = ownerName.trim();
    const trimmedOwnerContact = ownerContact ? ownerContact.trim() : '';
    const purseVal = parseInt(pointsPurse, 10);
    const purse = isNaN(purseVal) || purseVal <= 0 ? 100000 : purseVal;

    const existingTeam = await prisma.team.findUnique({ where: { name: trimmedName } });
    if (existingTeam) {
      return NextResponse.json({ error: 'A team with this name already exists' }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        name: trimmedName,
        ownerName: trimmedOwnerName,
        ownerContact: trimmedOwnerContact,
        pointsPurse: purse,
        pointsSpent: 0,
        logoUrl: logoUrl,
      }
    });

    return NextResponse.json({ success: true, message: 'Team created successfully', team }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH: Set Captain / Vice-Captain for a team
export async function PATCH(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const { teamId, captainId, viceCaptainId } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    // Clear existing C/VC for this team first
    await prisma.playerProfile.updateMany({
      where: { teamId },
      data: { isCaptain: false, isViceCaptain: false },
    });

    // Set new captain
    if (captainId) {
      await prisma.playerProfile.update({
        where: { id: captainId },
        data: { isCaptain: true },
      });
    }

    // Set new vice-captain (must be a different player)
    if (viceCaptainId && viceCaptainId !== captainId) {
      await prisma.playerProfile.update({
        where: { id: viceCaptainId },
        data: { isViceCaptain: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Captain and Vice Captain updated.' });
  } catch (error) {
    console.error('Error setting captain:', error);
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

    const team = await prisma.team.findUnique({ where: { id }, include: { players: true } });
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.players.length > 0) {
      return NextResponse.json({ error: 'Cannot delete a team that already has drafted players' }, { status: 400 });
    }

    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
