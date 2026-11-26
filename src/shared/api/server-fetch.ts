import 'server-only'
import type { z } from 'zod'
import { env } from '../config/env'
import { toApiError } from './api-error'
import { parseResponse } from './parse'

type Query = Record<string, string | number | undefined>

type ServerFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: Query
  body?: unknown
  token?: string // access token đọc từ cookie httpOnly
}

// Gọi EduHub API từ SERVER bằng fetch. Lỗi đi qua CÙNG hàm toApiError với axios ở trình duyệt,
// nên thông báo lỗi giống hệt nhau dù dữ liệu lấy ở server hay client.
export async function serverFetch<T extends z.ZodType>(path: string, schema: T, options?: ServerFetchOptions): Promise<z.output<T>>
export async function serverFetch(path: string, schema?: undefined, options?: ServerFetchOptions): Promise<void>
export async function serverFetch(path: string, schema?: z.ZodType, options: ServerFetchOptions = {}) {
  const url = new URL(path, env.API_URL)
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }

  let res: Response
  try {
    res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw toApiError(undefined, undefined)
  }

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => undefined)
    throw toApiError(res.status, body)
  }
  if (!schema || res.status === 204) return undefined
  return parseResponse(schema, await res.json())
}
