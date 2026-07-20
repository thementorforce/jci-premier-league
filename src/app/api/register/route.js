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

    const trimmedEmail = email.trim();
    const trimmedMobile = mobileNumber.trim();
    const trimmedTxId = transactionId.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    if (!/^\d{10}$/.test(trimmedMobile)) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    if (trimmedTxId.length < 6) {
      return NextResponse.json({ error: 'Please enter a valid UPI transaction reference ID' }, { status: 400 });
    }

    if (!photoBase64) {
      return NextResponse.json({ error: 'Player photo is required' }, { status: 400 });
    }

    // Check for existing player with same mobile number or transaction ID
    const existingPlayer = await prisma.playerProfile.findFirst({
      where: {
        OR: [
          { mobileNumber: trimmedMobile },
          { transactionId: trimmedTxId },
        ],
      },
    });

    if (existingPlayer) {
      if (existingPlayer.mobileNumber === trimmedMobile) {
        return NextResponse.json({ error: 'A player with this mobile number is already registered.' }, { status: 400 });
      }
      if (existingPlayer.transactionId === trimmedTxId) {
        return NextResponse.json({ error: 'This UPI Transaction / UTR ID has already been submitted.' }, { status: 400 });
      }
    }

    const player = await prisma.playerProfile.create({
      data: {
        fullName: fullName.trim(),
        email: trimmedEmail,
        mobileNumber: trimmedMobile,
        organization: organization.trim(),
        gender,
        ageGroup,
        jerseySize,
        preferredRole,
        experience,
        photoUrl: photoBase64,
        transactionId: trimmedTxId,
        paymentScreenshot: paymentScreenshot || null,
        paymentStatus: 'Pending',
        status: 'Registered',
      },
    });

    return NextResponse.json({ success: true, player }, { status: 201 });
  } catch (error) {
    console.error('Error in player registration API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
