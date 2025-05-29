import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log("🔥 middleware ทำงานแล้ว");
  const token = request.cookies.get('token')?.value;

  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next(); // ปล่อยผ่าน
}

export const config = {
  matcher: ['/chat/:path*'], // ตรวจสอบทุก path ที่ขึ้นต้นด้วย /chat
};
