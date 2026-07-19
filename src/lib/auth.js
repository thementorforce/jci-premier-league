import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'fcl_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.AUTH_SECRET || 'fcl-dev-secret-change-in-production';
}

function signPayload(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;

  const expected = crypto.createHmac('sha256', getSecret()).update(data).digest('base64url');
  if (sig !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(user) {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  return signPayload(payload);
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return {
      session: null,
      response: NextResponse.json({ error: 'Unauthorized. Admin login required.' }, { status: 401 }),
    };
  }
  return { session, response: null };
}

export function setSessionCookie(response, token) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export function clearSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
