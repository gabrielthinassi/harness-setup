import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';

export async function POST(request: Request): Promise<Response> {
  await deleteSession();
  return NextResponse.redirect(new URL('/login', request.url), 303);
}
