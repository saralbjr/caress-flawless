import { NextResponse } from 'next/server';
import { removeAuthCookie } from '@/utils/auth';

export function POST() {
  const response = NextResponse.json(
    { success: true },
    { status: 200 }
  );
  
  // Remove auth cookie
  removeAuthCookie(response);
  
  return response;
}