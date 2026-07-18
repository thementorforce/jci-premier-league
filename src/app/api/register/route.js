import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      mobileNumber,
      organization,
      gender,
      ageGroup,
      jerseySize,
      preferredRole,
      experience,
      photoBase64
    } = body;

    // Basic Validation
    if (!fullName || !mobileNumber || !organization || !gender || !ageGroup || !jerseySize || !preferredRole || !experience) {
      return NextResponse.json({ error: 'All mandatory fields must be filled' }, { status: 400 });
    }

    // Save player profile to DB
    const player = await prisma.playerProfile.create({
      data: {
        fullName,
        mobileNumber,
        organization,
        gender,
        ageGroup,
        jerseySize,
        preferredRole,
        experience,
        photoUrl: photoBase64 || null, // Storing base64 string directly for simplicity (in a production setup this can be a GCS URL)
      }
    });

    return NextResponse.json({ success: true, player }, { status: 201 });
  } catch (error) {
    console.error('Error in player registration API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
