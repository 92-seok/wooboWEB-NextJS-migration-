import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/data/store';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const role = searchParams.get('role');
  const isActive = searchParams.get('isActive');
  const search = searchParams.get('search');

  let filtered = users.map(({ password: _, ...u }) => u);

  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }

  if (isActive !== null && isActive !== '') {
    filtered = filtered.filter((u) => u.isActive === (isActive === 'true'));
  }

  if (search) {
    filtered = filtered.filter(
      (u) => u.username.includes(search) || u.name.includes(search)
    );
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({
    data,
    meta: { total, totalPages },
  });
}
