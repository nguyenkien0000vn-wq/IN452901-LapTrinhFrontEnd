import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import type { LoginValues, RegisterValues } from '../model/auth.schema'
import type { Member } from '../model/member'
import { useAuthStore } from '../store'

export const authKeys = {
  session: ['auth', 'session'] as const,
}

// Mở/tải lại trang: thử đổi cookie refresh lấy access token mới, rồi đọc thông tin
// người dùng. Dùng useQuery (thay vì useEffect) nên React StrictMode gọi 2 lần
// cũng chỉ có MỘT request — quan trọng vì mỗi refresh token chỉ dùng được một lần.
export function useSessionRestore() {
  return useQuery({
    queryKey: authKeys.session,
    queryFn: async (): Promise<Member | null> => {
      try {
        const token = await authApi.refresh()
        useAuthStore.getState().setToken(token)
        const member = await authApi.me()
        useAuthStore.getState().setSession(token, member)
        return member
      } catch {
        return null // chưa đăng nhập
      }
    },
    staleTime: Infinity,
    retry: false,
  })
}

export function useCurrentMember() {
  return useAuthStore((s) => s.member)
}

export function useLogin() {
  return useMutation({
    mutationFn: async (values: LoginValues): Promise<Member> => {
      const token = await authApi.login(values)
      useAuthStore.getState().setToken(token) // để request /me sau đây có header Bearer
      try {
        const member = await authApi.me()
        useAuthStore.getState().setSession(token, member)
        return member
      } catch (error) {
        useAuthStore.getState().clear()
        throw error
      }
    },
  })
}

export function useRegisterAccount() {
  return useMutation({
    mutationFn: ({ studentId, name, email, password }: RegisterValues) =>
      authApi.register({ studentId, name, email, password }),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      useAuthStore.getState().clear()
      queryClient.clear() // xoá cache của người dùng cũ (đăng ký của tôi…)
    },
  })
}
