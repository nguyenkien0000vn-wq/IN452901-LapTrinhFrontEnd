'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { isApiError } from '../../shared/api/api-error'
import { serverFetch } from '../../shared/api/server-fetch'
import { tokenResponseSchema } from './dto/auth.dto'
import { loginSchema } from './model/auth.schema'
import { decodeSession, TOKEN_COOKIE } from './session'

export type LoginState = {
  message?: string
  fieldErrors?: { email?: string; password?: string }
  values?: { email: string }
}

// Chỉ chuyển tiếp tới đường dẫn nội bộ (chặn ?redirect=https://trang-la.com)
function safeRedirect(value: FormDataEntryValue | null): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const input = { email: String(formData.get('email') ?? ''), password: String(formData.get('password') ?? '') }
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    const errors = z.flattenError(parsed.error).fieldErrors
    return {
      fieldErrors: { email: errors.email?.[0], password: errors.password?.[0] },
      values: { email: input.email },
    }
  }

  let accessToken: string
  try {
    ;({ accessToken } = await serverFetch('/api/auth/login', tokenResponseSchema, { method: 'POST', body: parsed.data }))
  } catch (error) {
    return {
      message: isApiError(error) ? error.message : 'Không đăng nhập được, thử lại sau.',
      values: { email: input.email },
    }
  }

  const session = decodeSession(accessToken)
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: session?.expiresAt,
  })
  redirect(safeRedirect(formData.get('redirect')))
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_COOKIE)
  redirect('/')
}
