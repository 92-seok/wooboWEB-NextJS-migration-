import { NextRequest, NextResponse } from "next/server";
import devices from '@/data/devices-si.json';

export async function GET(request: NextRequest) {
  const bdongCd = request.nextUrl.searchParams
    .get('BDONG_CD');

  let filtered = devices.filter(
    (d) => d.ErrorChk === 0
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