import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// const publicRoutes = ['/', '/chats'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  // console.log("ทดอสอบ:"+token)

  // ถ้ามี token แล้วไป /login หรือ /register → redirect ไป /chats
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/chats', request.url));
  }

  // ถ้าไม่มี token แล้วพยายามเข้าหน้า protected → redirect ไป /login
  if (!token && pathname === '/chats') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
   matcher: ['/((?!_next|favicon.ico).*)'],
};


// export function middleware(request: NextRequest) {
//   console.log("🔥 middleware ทำงานแล้ว");
//   const token = request.cookies.get('token')?.value;

//   if (!token) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }

//   return NextResponse.next(); // ปล่อยผ่าน
// }

// export const config = {
//   matcher: ['/chat/:path*'], // ตรวจสอบทุก path ที่ขึ้นต้นด้วย /chat
// };
