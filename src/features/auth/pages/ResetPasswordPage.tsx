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
      <AuthPageShell title="איפוס סיסמה">
        <div className="space-y-5">
          <Alert variant="error" size="sm" message="קישור איפוס הסיסמה חסר או אינו תקין." className="rounded-xl" />
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

  const validate = (): boolean => {
    const next: FieldErrors = {}
    const pwResult = passwordSchema.safeParse(newPassword)
    if (!pwResult.success) next.newPassword = pwResult.error.issues[0].message

    if (!confirmPassword) next.confirmPassword = 'יש לאמת את הסיסמה'
    else if (confirmPassword !== newPassword) next.confirmPassword = 'הסיסמאות אינן תואמות'

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
      setError(getErrorMessage(err, 'לא ניתן לאפס את הסיסמה כרגע. נסה שוב.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell title="איפוס סיסמה" description="בחר סיסמה חדשה. הסיסמה חייבת לכלול אות גדולה, אות קטנה ותו מיוחד.">
      {message ? (
        <div className="space-y-5" aria-live="polite">
          <Alert variant="success" size="sm" message={message} className="rounded-xl" />
          <Button
            type="button"
            fullWidth
            onClick={() => void navigate('/login')}
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            מעבר להתחברות
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <PasswordInput
            label="סיסמה חדשה"
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
            label="אימות סיסמה"
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
            isLoading={isSubmitting}
            loadingLabel="מאפסים..."
            fullWidth
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            <span>שמירת סיסמה חדשה</span>
            <Save className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
            >
              שלח קישור חדש
            </Link>
          </div>
        </form>
      )}
    </AuthPageShell>
  )
}
