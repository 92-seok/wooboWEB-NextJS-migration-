import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { role } = await request.json();

  const user = users.find((u) => u.id === parseInt(id));

  if (!user) {
    return NextResponse.json(
      { message: '사용자를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  user.role = role;

  const { password: _, ...safeUser } = user;
  return NextResponse.json({
    message: '역할이 변경되었습니다.',
    user: safeUser,
  });
}
