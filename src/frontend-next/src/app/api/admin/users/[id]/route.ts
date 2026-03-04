import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = users.find((u) => u.id === parseInt(id));

  if (!user) {
    return NextResponse.json(
      { message: '사용자를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = users.findIndex((u) => u.id === parseInt(id));

  if (index === -1) {
    return NextResponse.json(
      { message: '사용자를 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  users.splice(index, 1);

  return NextResponse.json({
    message: '사용자가 삭제되었습니다.',
    userId: parseInt(id),
  });
}
