import { NextRequest, NextResponse } from "next/server";
import devices from '@/data/devices-si.json';

export async function GET(request: NextRequest) {
  const bdongCd = request.nextUrl.searchParams
    .get('BDONG_CD');

  const filtered = bdongCd ? devices.filter((d) => d.BDONG_CD === bdongCd) : devices;

  return NextResponse.json({
    success: true,
    data: filtered,
  })
}