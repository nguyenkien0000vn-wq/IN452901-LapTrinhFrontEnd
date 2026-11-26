import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { applyServerErrors } from '../../../shared/lib/form-errors'
import { Button } from '../../../shared/ui/Button'
import { FormField, inputClass } from '../../../shared/ui/FormField'
import { useLogin } from '../hooks/use-auth'
import { loginSchema, type LoginValues } from '../model/auth.schema'
import type { Member } from '../model/member'

export function LoginForm({ onSuccess }: { onSuccess: (member: Member) => void }) {
  const login = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  const submit = handleSubmit(async (values) => {
    try {
      onSuccess(await login.mutateAsync(values))
    } catch (error) {
      applyServerErrors(error, setError) // 401 → "Email hoặc mật khẩu không đúng."
    }
  })

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 rounded-lg border border-line bg-surface p-6 shadow-md sm:p-8">
      {errors.root?.server && (
        <p role="alert" className="rounded-sm bg-warning-soft px-4 py-3 font-semibold text-danger">
          {errors.root.server.message}
        </p>
      )}
      <FormField id="email" label="Email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby="email-msg"
          className={inputClass}
        />
      </FormField>
      <FormField id="password" label="Mật khẩu" error={errors.password?.message}>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          aria-invalid={Boolean(errors.password)}
          aria-describedby="password-msg"
          className={inputClass}
        />
      </FormField>
      <Button type="submit" disabled={isSubmitting} className="justify-self-start">
        {isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </Button>
    </form>
  )
}
