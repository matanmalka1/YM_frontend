import { useState } from 'react'
import { Lock, Save } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { authApi } from '@/api/auth.api'
import { Alert } from '@/components/ui/overlays/Alert'
import { PasswordInput } from '@/components/ui/inputs/PasswordInput'
import { Button } from '@/components/ui/primitives/Button'
import { getErrorMessage } from '@/utils/utils'
import { passwordSchema } from '@/utils/passwordSchema'
import { AuthPageShell } from '@/features/auth'
import { AUTH_MESSAGES } from '../messages'
import { AUTH_ERROR_MESSAGES } from '../errorMessages'

type FieldErrors = { newPassword?: string; confirmPassword?: string }

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')?.trim() ?? ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!token) {
    return (
      <AuthPageShell title={AUTH_MESSAGES.resetPassword.title}>
        <div className="space-y-5">
          <Alert variant="error" size="sm" message={AUTH_ERROR_MESSAGES.resetPassword.invalidLink} className="rounded-xl" />
          <Button
            type="button"
            fullWidth
            onClick={() => void navigate('/forgot-password')}
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            {AUTH_MESSAGES.common.sendNewLink}
          </Button>
        </div>
      </AuthPageShell>
    )
  }

  const validate = (): boolean => {
    const next: FieldErrors = {}
    const pwResult = passwordSchema.safeParse(newPassword)
    if (!pwResult.success) next.newPassword = pwResult.error.issues[0].message

    if (!confirmPassword) next.confirmPassword = AUTH_ERROR_MESSAGES.resetPassword.confirmRequired
    else if (confirmPassword !== newPassword) next.confirmPassword = AUTH_ERROR_MESSAGES.resetPassword.mismatch

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting || !validate()) return
    setError(null)
    setIsSubmitting(true)
    try {
      const res = await authApi.resetPassword({ token, new_password: newPassword })
      setMessage(res.message)
    } catch (err) {
      setError(getErrorMessage(err, AUTH_ERROR_MESSAGES.resetPassword.submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell title={AUTH_MESSAGES.resetPassword.title} description={AUTH_MESSAGES.resetPassword.description}>
      {message ? (
        <div className="space-y-5" aria-live="polite">
          <Alert variant="success" size="sm" message={message} className="rounded-xl" />
          <Button
            type="button"
            fullWidth
            onClick={() => void navigate('/login')}
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            {AUTH_MESSAGES.common.goToLogin}
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <PasswordInput
            label={AUTH_MESSAGES.common.newPasswordLabel}
            placeholder="••••••••"
            disabled={isSubmitting}
            autoComplete="new-password"
            error={fieldErrors.newPassword}
            startIcon={<Lock className="h-4 w-4" />}
            className="rounded-xl border-slate-200 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:ring-slate-900/20 disabled:bg-slate-50"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              setFieldErrors((prev) => ({ ...prev, newPassword: undefined }))
            }}
          />

          <PasswordInput
            label={AUTH_MESSAGES.common.confirmPasswordLabel}
            placeholder="••••••••"
            disabled={isSubmitting}
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
            startIcon={<Lock className="h-4 w-4" />}
            className="rounded-xl border-slate-200 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:ring-slate-900/20 disabled:bg-slate-50"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
          />

          {error && (
            <div aria-live="polite">
              <Alert variant="error" size="sm" message={error} className="rounded-xl" />
            </div>
          )}

          <Button
            type="submit"
            icon={<Save className="h-4 w-4" />}
            isLoading={isSubmitting}
            loadingLabel={AUTH_MESSAGES.resetPassword.loading}
            fullWidth
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            <span>{AUTH_MESSAGES.resetPassword.submit}</span>
          </Button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900">
              {AUTH_MESSAGES.common.sendNewLink}
            </Link>
          </div>
        </form>
      )}
    </AuthPageShell>
  )
}
