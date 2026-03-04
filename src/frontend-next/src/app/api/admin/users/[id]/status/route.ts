import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { isActive } = await request.json();

  const user = users.find((u) => u.id === parseInt(id));

  if (!user) {
    return NextResponse.json(
      { message: '사용자를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  user.isActive = isActive;

  const { password: _, ...safeUser } = user;
  return NextResponse.json({
    message: '상태가 변경되었습니다.',
    user: safeUser,
  });
}
