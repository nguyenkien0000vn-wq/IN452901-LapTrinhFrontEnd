import { revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { TOKEN_COOKIE } from '../../../features/auth/session'
import { env } from '../../../shared/config/env'

// BFF (Backend For Frontend): trình duyệt gọi /api/... CÙNG origin với trang,
// route này gắn token lấy từ cookie httpOnly rồi chuyển tiếp tới EduHub API.
// Nhờ vậy cookie là first-party, token không bao giờ lộ ra JavaScript.
async function proxyToApi(request: NextRequest, ctx: RouteContext<'/api/[...path]'>) {
  const { path } = await ctx.params
  if (path[0] === 'auth') {
    return Response.json({ status: 404, title: 'Không tìm thấy' }, { status: 404 })
  }

  const target = new URL(`/api/${path.map(encodeURIComponent).join('/')}`, env.API_URL)
  target.search = request.nextUrl.search

  const token = request.cookies.get(TOKEN_COOKIE)?.value
  const hasBody = request.method !== 'GET' && request.method !== 'DELETE'
  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': request.headers.get('content-type') ?? 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: hasBody ? await request.text() : undefined,
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    return Response.json(
      { status: 503, title: 'Dịch vụ tạm thời không khả dụng', detail: 'BFF không kết nối được EduHub API.' },
      { status: 503 },
    )
  }

  if (upstream.ok && request.method !== 'GET' && path[0] === 'registrations') {
    revalidateTag('events', { expire: 0 })
  }

  const body = upstream.status === 204 ? null : await upstream.text()
  return new Response(body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  })
}

export const GET = proxyToApi
export const POST = proxyToApi
export const PUT = proxyToApi
export const DELETE = proxyToApi
