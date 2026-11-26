// Logic form "Đăng ký thành viên" — tách khỏi component để dễ đọc và dễ test.
// Ch04 chưa có server: lưu vào localStorage và giả lập mạng chậm.

export type MemberInput = {
  studentId: string
  name: string
  email: string
  clubId: string
}

export type FieldErrors = Partial<Record<keyof MemberInput, string>>

export type RegisterState =
  | { status: 'idle' }
  | { status: 'error'; message: string; errors: FieldErrors; values: MemberInput }
  | { status: 'success'; member: MemberInput }

export const initialRegisterState: RegisterState = { status: 'idle' }

const STORAGE_KEY = 'eduhub-members'

export function validateMember(input: MemberInput): FieldErrors {
  const errors: FieldErrors = {}
  if (!/^\d{10}$/.test(input.studentId)) errors.studentId = 'MSSV gồm đúng 10 chữ số.'
  if (input.name.trim().length < 2) errors.name = 'Họ tên cần ít nhất 2 ký tự.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = 'Email chưa đúng định dạng.'
  if (input.clubId === '') errors.clubId = 'Hãy chọn một câu lạc bộ.'
  return errors
}

export function loadMembers(): MemberInput[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as MemberInput[]
  } catch {
    return []
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Action cho useActionState: nhận state cũ + FormData, trả state mới.
// Trong lúc hàm async này chạy, React đặt isPending = true.
export async function registerMemberAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const values: MemberInput = {
    studentId: String(formData.get('studentId') ?? '').trim(),
    name: String(formData.get('name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    clubId: String(formData.get('clubId') ?? ''),
  }

  const errors = validateMember(values)
  if (Object.keys(errors).length > 0) {
    return { status: 'error', message: 'Vui lòng sửa các ô được đánh dấu.', errors, values }
  }

  await wait(800) // giả lập gửi lên server mất 0,8 giây

  const members = loadMembers()
  if (members.some((m) => m.email === values.email)) {
    // Giống mã 409 Conflict của API thật ở Ch05
    return {
      status: 'error',
      message: 'Email này đã đăng ký.',
      errors: { email: 'Email đã tồn tại.' },
      values,
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...members, values]))
  return { status: 'success', member: values }
}
