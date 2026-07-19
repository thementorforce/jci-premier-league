import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import prisma from '@/lib/db';

const execPromise = util.promisify(exec);

export async function GET() {
  const diagnostics = {
    schemaPush: null,
    seeding: null,
    databaseSummary: {
      users: 0,
      teams: 0,
      players: 0,
      ads: 0
    }
  };

  try {
    let dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes('@/')) {
      dbUrl = dbUrl.replace('@/', '@localhost/');
    }

    // 1. Run Schema Push
    try {
      const { stdout, stderr } = await execPromise(
        'node node_modules/prisma/build/index.js db push --accept-data-loss',
        {
          env: { ...process.env, DATABASE_URL: dbUrl }
        }
      );
      diagnostics.schemaPush = { success: true, stdout, stderr };
    } catch (e) {
      diagnostics.schemaPush = { success: false, error: e.message, stdout: e.stdout, stderr: e.stderr };
      return NextResponse.json({ success: false, error: 'Schema push failed', diagnostics });
    }

    // 2. Run Database Seeding
    try {
      const { stdout, stderr } = await execPromise(
        'node prisma/seed.js',
        {
          env: { ...process.env, DATABASE_URL: dbUrl }
        }
      );
      diagnostics.seeding = { success: true, stdout, stderr };
    } catch (e) {
      diagnostics.seeding = { success: false, error: e.message, stdout: e.stdout, stderr: e.stderr };
      return NextResponse.json({ success: false, error: 'Database seeding failed', diagnostics });
    }

    // 3. Query counts to verify
    try {
      diagnostics.databaseSummary.users = await prisma.user.count();
      diagnostics.databaseSummary.teams = await prisma.team.count();
      diagnostics.databaseSummary.players = await prisma.playerProfile.count();
      diagnostics.databaseSummary.ads = await prisma.adPlacement.count();
    } catch (e) {
      return NextResponse.json({
        success: true,
        message: 'Sync & Seed commands completed, but failed to query database status',
        error: e.message,
        diagnostics
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database synced and seeded successfully!',
      diagnostics
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'An unexpected error occurred',
      diagnostics
    });
  }
}
