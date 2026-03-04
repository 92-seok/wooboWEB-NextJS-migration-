import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/store';
import { generateToken } from '@/data/tokens';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return NextResponse.json(
      { message: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 }
    );
  }

  const { password: _, ...safeUser } = user;

  return NextResponse.json({
    accessToken: generateToken(username, 'access'),
    refreshToken: generateToken(username, 'refresh'),
    user: safeUser,
  });
}