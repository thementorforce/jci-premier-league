import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      fullName,
      email,
      mobileNumber,
      organization,
      gender,
      ageGroup,
      jerseySize,
      preferredRole,
      experience,
      photoBase64,
      transactionId,
      paymentScreenshot
    } = body;

    if (!fullName || !email || !mobileNumber || !organization || !gender || !ageGroup || !jerseySize || !preferredRole || !experience || !transactionId) {
      return NextResponse.json({ error: 'All mandatory fields and UPI transaction ID must be filled' }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!photoBase64) {
      return NextResponse.json({ error: 'Player photo is required' }, { status: 400 });
    }

    const player = await prisma.playerProfile.create({
      data: {
        fullName,
        email: email.trim(),
        mobileNumber,
        organization,
        gender,
        ageGroup,
        jerseySize,
        preferredRole,
        experience,
        photoUrl: photoBase64,
        transactionId,
        paymentScreenshot: paymentScreenshot || null,
        paymentStatus: 'Pending',
        status: 'Registered'
      }
    });

    return NextResponse.json({ success: true, player }, { status: 201 });
  } catch (error) {
    console.error('Error in player registration API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
