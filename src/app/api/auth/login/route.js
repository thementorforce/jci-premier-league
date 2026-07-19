import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username: username.trim() } });

    if (!user || user.password !== password || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const token = createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      token,
      user: { username: user.username, role: user.role },
    });
    return setSessionCookie(response, token);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
