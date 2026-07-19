import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    let dbUrl = process.env.DATABASE_URL || '';
    // Patch empty host if present
    if (dbUrl.includes('@/')) {
      dbUrl = dbUrl.replace('@/', '@localhost/');
    }

    const { stdout, stderr } = await execPromise(
      'node node_modules/prisma/build/index.js db push --accept-data-loss',
      {
        env: {
          ...process.env,
          DATABASE_URL: dbUrl
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Prisma db push executed successfully!',
      stdout: stdout || '',
      stderr: stderr || ''
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || 'An error occurred during execution',
      stdout: error.stdout || '',
      stderr: error.stderr || ''
    });
  }
}
