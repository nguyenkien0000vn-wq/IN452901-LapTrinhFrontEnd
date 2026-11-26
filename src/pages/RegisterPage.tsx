import { useActionState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Link } from 'react-router'
import { PageContainer } from '../components/PageContainer'
import { clubs, findClub } from '../data'
import { initialRegisterState, registerMemberAction, type MemberInput } from '../lib/register-member'

const inputClass =
  'min-h-11 w-full rounded-sm border bg-bg px-3 py-2 focus-visible:border-accent-strong focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/35 aria-invalid:border-danger'

export function RegisterPage() {
  // useActionState: [state hiện tại, hàm gắn vào <form action>, đang chạy hay không]
  const [state, formAction, isPending] = useActionState(registerMemberAction, initialRegisterState)

  if (state.status === 'success') {
    const club = findClub(state.member.clubId)
    return (
      <PageContainer narrow>
        <div role="status" className="rounded-lg border border-line bg-surface p-8 shadow-md">
          <h1>Đăng ký thành công</h1>
          <p className="mt-3 text-lg">
            Chào <strong>{state.member.name}</strong>! Bạn đã đăng ký vào <strong>{club?.name}</strong>. Ban chủ
            nhiệm sẽ liên hệ qua email {state.member.email}.
          </p>
          <Link to="/events" className="mt-6 inline-block text-primary underline underline-offset-4">
            Xem lịch sự kiện →
          </Link>
        </div>
      </PageContainer>
    )
  }

  const errors = state.status === 'error' ? state.errors : {}
  // React tự xoá form sau khi action chạy xong; defaultValue giữ lại giá trị khi có lỗi
  const values: Partial<MemberInput> = state.status === 'error' ? state.values : {}

  return (
    <PageContainer narrow>
      <h1>Đăng ký thành viên</h1>
      <p className="mt-3 mb-8 text-lg text-ink-muted">
        Điền thông tin bên dưới. Ô có dấu <span className="text-danger">*</span> là bắt buộc.
      </p>

      {/* noValidate: tắt kiểm tra của trình duyệt để thấy lỗi do action trả về */}
      <form
        action={formAction}
        noValidate
        aria-busy={isPending}
        className="grid gap-4 rounded-lg border border-line bg-surface p-6 shadow-md sm:p-8"
      >
        {state.status === 'error' && (
          <p role="alert" className="rounded-sm bg-warning-soft px-4 py-3 font-semibold text-danger">
            {state.message}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="studentId" label="Mã số sinh viên" error={errors.studentId} hint="Gồm đúng 10 chữ số.">
            <input
              id="studentId"
              name="studentId"
              inputMode="numeric"
              maxLength={10}
              autoComplete="off"
              defaultValue={values.studentId}
              aria-invalid={Boolean(errors.studentId)}
              aria-describedby="studentId-msg"
              className={`${inputClass} border-line`}
            />
          </Field>
          <Field id="name" label="Họ và tên" error={errors.name}>
            <input
              id="name"
              name="name"
              autoComplete="name"
              defaultValue={values.name}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="name-msg"
              className={`${inputClass} border-line`}
            />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="mssv@sv.dthu.edu.vn"
              defaultValue={values.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby="email-msg"
              className={`${inputClass} border-line`}
            />
          </Field>
          <Field id="clubId" label="Câu lạc bộ muốn tham gia" error={errors.clubId}>
            <select
              id="clubId"
              name="clubId"
              defaultValue={values.clubId ?? ''}
              aria-invalid={Boolean(errors.clubId)}
              aria-describedby="clubId-msg"
              className={`${inputClass} border-line`}
            >
              <option value="">— Chọn CLB —</option>
              {clubs.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <SubmitButton />
      </form>
    </PageContainer>
  )
}

type FieldProps = {
  id: string
  label: string
  error?: string
  hint?: string
  children: ReactNode
}

function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="grid content-start gap-1">
      <label htmlFor={id} className="font-semibold">
        {label} <span className="text-danger">*</span>
      </label>
      {children}
      <small id={`${id}-msg`} className={error ? 'text-sm font-semibold text-danger' : 'text-sm text-ink-muted'}>
        {error ?? hint}
      </small>
    </div>
  )
}

// useFormStatus đọc trạng thái của <form> cha gần nhất → phải nằm trong component con
function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-full bg-primary px-6 py-2 font-semibold text-on-primary transition-colors hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? 'Đang gửi…' : 'Đăng ký'}
    </button>
  )
}
