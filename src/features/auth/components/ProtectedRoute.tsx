import { Navigate, Outlet, useLocation } from 'react-router'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { PageContainer } from '../../../shared/ui/PageContainer'
import { Spinner } from '../../../shared/ui/Spinner'
import { useSessionRestore } from '../hooks/use-auth'
import type { Role } from '../model/member'
import { useAuthStore } from '../store'

// Route bảo vệ: chưa đăng nhập → /login?redirect=<trang đang mở>; sai vai trò → báo không có quyền
export function ProtectedRoute({ role }: { role?: Role }) {
  const session = useSessionRestore()
  const member = useAuthStore((s) => s.member)
  const location = useLocation()

  if (!member && session.isPending) return <Spinner label="Đang kiểm tra đăng nhập…" />

  if (!member) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (role && member.role !== role) {
    return (
      <PageContainer narrow>
        <ErrorState error={new Error('Bạn không có quyền vào trang này.')} />
      </PageContainer>
    )
  }

  return <Outlet />
}
