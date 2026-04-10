import { NextResponse } from 'next/server';

export const runtime = 'edge'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    // If no code, send them back to the login page you have in Photo 1
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If success, send them to the dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
