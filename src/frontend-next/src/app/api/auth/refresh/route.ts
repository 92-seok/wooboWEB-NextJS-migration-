import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, generateToken } from '@/data/tokens';

export async function POST(request: NextRequest) {
  const { refreshToken } = await request.json();
  const payload = verifyToken(refreshToken);

  if (!payload || payload.type !== 'refresh') {
    return NextResponse.json(
      { message: '토큰 갱신 실패' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    accessToken: generateToken(
      payload.username,
      'access'
    ),
    refreshToken: generateToken(
      payload.username,
      'refresh'
    ),
  });
}