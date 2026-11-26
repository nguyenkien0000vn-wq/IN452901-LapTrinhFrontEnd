import axios from 'axios'
import { env } from '../config/env'

// MỘT axios instance cho cả ứng dụng: baseURL, timeout, cookie đặt ở đúng một chỗ.
// Interceptor (gắn token, chuẩn hoá lỗi) được gắn ở app/http-setup.ts.
export const httpClient = axios.create({
  baseURL: env.API_URL,
  timeout: 10_000,
  withCredentials: true, // gửi kèm cookie refreshToken (httpOnly) cho /api/auth/refresh
})
