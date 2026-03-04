import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    data: null,
    message: '차단기 제어 명령이 전송되었습니다.',
  });
}