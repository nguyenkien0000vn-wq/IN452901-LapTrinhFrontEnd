import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ApiError, toApiError } from './api-error'

export type AuthHooks = {
  getToken: () => string | null
  onLogout: () => void
  // ★ Có hàm refresh thì gặp 401 sẽ xin access token mới rồi gửi lại request
  refresh?: () => Promise<string>
}

// AxiosError → ApiError. Request bị huỷ (AbortController) thì giữ nguyên để TanStack Query tự xử lý.
export function normalizeAxiosError(error: unknown): unknown {
  if (error instanceof ApiError || axios.isCancel(error)) return error
  if (axios.isAxiosError(error)) return toApiError(error.response?.status, error.response?.data)
  return error
}

/**
 * Gắn interceptor vào một axios instance. Trả về hàm gỡ interceptor (dùng trong test).
 */
export function setupInterceptors(client: AxiosInstance, hooks: AuthHooks): () => void {
  // 1. Request: có token thì gắn header Authorization
  const requestId = client.interceptors.request.use((config) => {
    const token = hooks.getToken()
    if (token) config.headers.set('Authorization', `Bearer ${token}`)
    return config
  })

  const retryWithNewToken = hooks.refresh ? createRefreshHandler(client, hooks.refresh) : null

  // 2. Response: thành công thì cho qua; lỗi thì chuẩn hoá về ApiError
  const responseId = client.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (retryWithNewToken && axios.isAxiosError(error) && canRetry(error.config, error.response?.status)) {
        try {
          return await retryWithNewToken(error.config!)
        } catch {
          // refresh thất bại → rơi xuống xử lý 401 bên dưới
        }
      }
      const normalized = normalizeAxiosError(error)
      // 401 khi đang có token = token hết hạn/không hợp lệ → đăng xuất.
      // Bỏ qua /api/auth/* (vd. đăng nhập sai mật khẩu không phải là "hết phiên").
      const isAuthCall = axios.isAxiosError(error) && isAuthUrl(error.config?.url)
      if (normalized instanceof ApiError && normalized.status === 401 && hooks.getToken() && !isAuthCall) {
        hooks.onLogout()
      }
      throw normalized
    },
  )

  return () => {
    client.interceptors.request.eject(requestId)
    client.interceptors.response.eject(responseId)
  }
}

function isAuthUrl(url: string | undefined): boolean {
  return url?.startsWith('/api/auth/') ?? false
}

// ---------- ★ Refresh token + hàng đợi (mở rộng, rubric không bắt buộc) ----------

const retried = new WeakSet<InternalAxiosRequestConfig>()

function canRetry(config: InternalAxiosRequestConfig | undefined, status: number | undefined): boolean {
  return (
    status === 401 &&
    config !== undefined &&
    !retried.has(config) && // mỗi request chỉ thử lại một lần
    !isAuthUrl(config.url) // không refresh cho chính login/refresh/logout
  )
}

export function createRefreshHandler(client: AxiosInstance, refresh: () => Promise<string>) {
  // Nhiều request cùng gặp 401: chỉ gọi refresh MỘT lần, các request còn lại
  // chờ chung promise này (hàng đợi), xong thì cùng gửi lại với token mới.
  let pending: Promise<string> | null = null

  return async (config: InternalAxiosRequestConfig) => {
    pending ??= refresh().finally(() => {
      pending = null
    })
    const token = await pending
    retried.add(config)
    config.headers.set('Authorization', `Bearer ${token}`)
    return client.request(config)
  }
}
