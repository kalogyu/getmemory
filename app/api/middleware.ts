import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// 验证JWT token
export function verifyToken(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY || 'your_secret_key', (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
}

// 中间件配置
export async function middleware(request: NextRequest) {
  // 不需要验证的路由
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth'
  ];

  // 检查是否是公开路由
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 获取token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json(
      { success: false, message: '未授权访问' },
      { status: 401 }
    );
  }

  try {
    // 验证token
    const decoded = await verifyToken(token);
    
    // 将用户信息添加到请求头中
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-Id', decoded.userId);

    // 继续处理请求
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'token无效或已过期' },
      { status: 401 }
    );
  }
}

// 配置需要进行中间件处理的路由
export const config = {
  matcher: [
    '/api/:path*',
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};