import { NextRequest, NextResponse } from 'next/server';
import history from '@/data/control-history.json';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const BDONG_CD = searchParams.get('BDONG_CD');
  const CD_DIST_OBSV = searchParams.get('CD_DIST_OBSV');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  let filtered = history.filter((h) => h.type === 'display');

  if (BDONG_CD) {
    filtered = filtered.filter((h) => h.BDONG_CD === BDONG_CD);
  }
  if (CD_DIST_OBSV) {
    filtered = filtered.filter((h) => h.CD_DIST_OBSV === CD_DIST_OBSV);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paged,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
