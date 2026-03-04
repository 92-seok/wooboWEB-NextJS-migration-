import { NextRequest, NextResponse } from 'next/server';
import devices from '@/data/devices-si.json';

export async function GET(request: NextRequest) {
  const bdongCd = request.nextUrl.searchParams.get('BDONG_CD');

  // 제어 장비: 예경보(17), 전광판(18), 차단기(20)
  const controlTypes = ['17', '18', '20'];

  let filtered = devices.filter((d) =>
    controlTypes.includes(d.GB_OBSV)
  );

  if (bdongCd) {
    filtered = filtered.filter(
      (d) => d.BDONG_CD === bdongCd
    );
  }

  return NextResponse.json({
    success: true,
    data: filtered,
  });
}
