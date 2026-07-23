import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) return auth.response;

  try {
    const players = await prisma.playerProfile.findMany({
      orderBy: { createdAt: 'asc' }
    });

    if (players.length === 0) {
      return new NextResponse('No players found', { status: 404 });
    }

    const headers = [
      'ID', 'Full Name', 'Mobile Number', 'Email', 'Organization', 
      'Gender', 'Age Group', 'Jersey Size', 'Preferred Role', 
      'Experience', 'Payment Status', 'Transaction ID', 'Status', 'Sold Price', 'Created At'
    ];

    const escapeCSV = (str) => {
      if (str === null || str === undefined) return '';
      const stringified = String(str);
      if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
        return `"${stringified.replace(/"/g, '""')}"`;
      }
      return stringified;
    };

    const csvRows = [headers.join(',')];

    for (const p of players) {
      const row = [
        p.id,
        p.fullName,
        p.mobileNumber,
        p.email,
        p.organization,
        p.gender,
        p.ageGroup,
        p.jerseySize,
        p.preferredRole,
        p.experience,
        p.paymentStatus,
        p.transactionId,
        p.status,
        p.soldPrice,
        p.createdAt.toISOString()
      ].map(escapeCSV);
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="jpl_players_export.csv"',
      },
    });
  } catch (error) {
    console.error('Error exporting players:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
