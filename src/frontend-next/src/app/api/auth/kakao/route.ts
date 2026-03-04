import { NextResponse } from 'next/server';
import { generateToken } from '@/data/tokens';

export async function POST() {
  const demoUser = {
    id: 100,
    username: 'kakao_user',
    name: '카카오 사용자',
    role: 'user',
    email: 'kakao@demo.com',
    isActive: true,
    lastLoginAt: new Date().toISOString(),
  };

  return NextResponse.json({
    accessToken: generateToken('kakao_user', 'access'),
    refreshToken: generateToken('kakao_user', 'refresh'),
    user: demoUser,
  });
}