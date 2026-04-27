// /api/auth/guest/route.ts

import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { username } = await req.json();

  const response = NextResponse.redirect(new URL('/', req.url));

  response.cookies.set('guest_token', randomUUID(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax"
  });

  response.cookies.set('user', JSON.stringify({
    username,
    isGuest: true,
  }), {
    sameSite: "lax"
  });

  return response;
}