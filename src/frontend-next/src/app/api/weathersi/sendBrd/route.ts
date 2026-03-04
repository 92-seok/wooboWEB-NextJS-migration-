import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: true,
    data: null,
    message: '방송 제어 명령이 전송되었습니다.',
  });
}