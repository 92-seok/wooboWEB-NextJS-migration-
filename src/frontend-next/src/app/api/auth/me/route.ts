import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/store';
import { verifyToken } from '@/data/tokens';

export async function GET(request: NextRequest) {
  const token = request.headers
    .get('authorization')
    ?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { message: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { message: '토큰이 유효하지 않습니다.' },
      { status: 401 }
    );
  }

  const user = users.find(
    (u) => u.username === payload.username
  );
  if (!user) {
    return NextResponse.json(
      { message: '사용자를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json({
    success: true,
    user: safeUser,
  });
}