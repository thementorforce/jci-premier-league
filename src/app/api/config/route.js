import { NextResponse } from 'next/server';
import { readConfig, writeConfig, VALID_AUCTION_STATUSES } from '@/lib/config';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  return NextResponse.json(await readConfig());
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const body = await request.json();
    const current = await readConfig();

    const config = {
      upiId: body.upiId ?? current.upiId,
      payeeName: body.payeeName ?? current.payeeName,
      regFee: body.regFee ?? current.regFee,
      auctionStatus: VALID_AUCTION_STATUSES.includes(body.auctionStatus)
        ? body.auctionStatus
        : current.auctionStatus,
    };

    await writeConfig(config);
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error writing config:', error);
    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  }
}
