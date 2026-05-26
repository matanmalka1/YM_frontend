import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Save } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { authApi } from '@/api/auth.api'
import { Alert } from '@/components/ui/overlays/Alert'
import { PasswordInput } from '@/components/ui/inputs/PasswordInput'
import { Button } from '@/components/ui/primitives/Button'
import { getErrorMessage } from '@/utils/utils'
import {
  resetPasswordDefaultValues,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas'
import { AuthPageShell } from '@/features/auth/components/AuthPageShell'

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')?.trim() ?? ''

  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormValues>({
    defaultValues: resetPasswordDefaultValues,
    resolver: zodResolver(resetPasswordSchema),
  })

  if (!token) {
    return (
      <AuthPageShell title="איפוס סיסמה">
        <div className="space-y-5">
          <Alert
            variant="error"
            size="sm"
            message="קישור איפוס הסיסמה חסר או אינו תקין."
            className="rounded-xl"
          />
          <Button
            type="button"
            fullWidth
            onClick={() => void navigate('/forgot-password')}
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            שלח קישור חדש
          </Button>
        </div>
      </AuthPageShell>
    )
  }

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setMessage(null)
    setIsSubmitting(true)
    try {
      const response = await authApi.resetPassword({ token, new_password: values.newPassword })
      setMessage(response.message)
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן לאפס את הסיסמה כרגע. נסה שוב.'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthPageShell
      title="איפוס סיסמה"
      description="בחר סיסמה חדשה. הסיסמה חייבת לכלול אות גדולה, אות קטנה ותו מיוחד."
    >

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <PasswordInput
          label="סיסמה חדשה"
          placeholder="••••••••"
          disabled={isSubmitting || Boolean(message)}
          autoComplete="new-password"
          error={errors.newPassword?.message}
          startIcon={<Lock className="h-4 w-4" />}
          className="rounded-xl border-slate-200 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:ring-slate-900/20 disabled:bg-slate-50"
          {...register('newPassword')}
        />

        <PasswordInput
          label="אימות סיסמה"
          placeholder="••••••••"
          disabled={isSubmitting || Boolean(message)}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          startIcon={<Lock className="h-4 w-4" />}
          className="rounded-xl border-slate-200 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:ring-slate-900/20 disabled:bg-slate-50"
          {...register('confirmPassword')}
        />

        <div aria-live="polite">
          {message ? (
            <Alert variant="success" size="sm" message={message} className="rounded-xl" />
          ) : error ? (
            <Alert variant="error" size="sm" message={error} className="rounded-xl" />
          ) : null}
        </div>

        {message ? (
          <Button
            type="button"
            fullWidth
            onClick={() => void navigate('/login')}
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            מעבר להתחברות
          </Button>
        ) : (
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingLabel="מאפסים..."
            fullWidth
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            <span>שמירת סיסמה חדשה</span>
            <Save className="h-4 w-4" />
          </Button>
        )}
      </form>
    </AuthPageShell>
  )
}
