import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/data/tokens';

export async function POST(request: NextRequest) {
  const { username, name } = await request.json();

  const newUser = {
    id: Date.now(),
    username,
    name,
    role: 'user',
    email: `${username}@demo.com`,
    isActive: true,
    lastLoginAt: new Date().toISOString(),
  };

  return NextResponse.json({
    accessToken: generateToken(username, 'access'),
    refreshToken: generateToken(username, 'refresh'),
    user: newUser,
  });
}