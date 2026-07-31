import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        team1: { select: { id: true, name: true } },
        team2: { select: { id: true, name: true } }
      },
      orderBy: { matchNumber: "asc" }
    });
    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Auto-increment match number
    const count = await prisma.match.count();
    
    const newMatch = await prisma.match.create({
      data: {
        matchNumber: count + 1,
        date: new Date(data.date),
        venue: data.venue,
        team1Id: data.team1Id,
        team2Id: data.team2Id,
        status: "SCHEDULED"
      }
    });
    
    return NextResponse.json({ success: true, match: newMatch });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, ...data } = await request.json();
    
    const updateData = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: updateData
    });
    
    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete match" }, { status: 500 });
  }
}
