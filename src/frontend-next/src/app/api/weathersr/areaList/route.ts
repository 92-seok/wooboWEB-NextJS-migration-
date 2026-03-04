import { NextResponse } from 'next/server';
import areas from '@/data/areas-sr.json';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: areas,
  });
}