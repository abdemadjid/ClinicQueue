import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function createSession(adminId: string) {
  const token = Buffer.from(JSON.stringify({ adminId, exp: Date.now() + 86400000 })).toString('base64');
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 86400, // 24 hours
    path: '/',
  });
  return token;
}

export async function getSession() {
  const token = cookies().get('session')?.value;
  if (!token) return null;
  
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    if (data.exp < Date.now()) return null;
    return data.adminId;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  cookies().delete('session');
}

export function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;
  
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString());
    if (data.exp < Date.now()) return null;
    return data.adminId;
  } catch {
    return null;
  }
}