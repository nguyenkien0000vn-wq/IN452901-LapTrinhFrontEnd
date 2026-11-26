import { NextResponse, type NextRequest } from 'next/server'
import { decodeSession, TOKEN_COOKIE } from './features/auth/session'

// proxy.ts (Next 16, trước đây là middleware.ts): chạy TRƯỚC khi render route.
// Chặn sớm các trang cần đăng nhập. Đây chỉ là lớp chặn giao diện —
// Server Action và API vẫn tự kiểm tra quyền.
export function proxy(request: NextRequest) {
  const session = decodeSession(request.cookies.get(TOKEN_COOKIE)?.value, Date.now())
  const { pathname, search } = request.nextUrl

  if (!session) {
    const login = new URL('/login', request.url)
    login.searchParams.set('redirect', pathname + search)
    return NextResponse.redirect(login)
  }

  if (pathname.startsWith('/admin') && session.role !== 'Admin') {
    return NextResponse.rewrite(new URL('/forbidden', request.url))
  }

  return NextResponse.next()
}

// matcher phải là hằng số (Next đọc lúc build) — đã khai báo sẵn
export const config = {
  matcher: ['/my-events/:path*', '/admin/:path*'],
}
