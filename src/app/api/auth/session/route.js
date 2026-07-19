import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.response) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { session } = auth;
  return NextResponse.json({
    authenticated: true,
    user: { username: session.username, role: session.role },
  });
}
