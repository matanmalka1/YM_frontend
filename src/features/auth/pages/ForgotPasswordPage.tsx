import { useState } from 'react'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

import { authApi } from '@/api/auth.api'
import { Alert } from '@/components/ui/overlays/Alert'
import { Input } from '@/components/ui/inputs/Input'
import { Button } from '@/components/ui/primitives/Button'
import { getErrorMessage } from '@/utils/utils'
import { AuthPageShell } from '@/features/auth'
import { AUTH_MESSAGES } from '../messages'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting || message) return

    const trimmed = email.trim()
    if (!trimmed) {
      setError(AUTH_MESSAGES.forgotPassword.emptyEmail)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError(AUTH_MESSAGES.forgotPassword.invalidEmail)
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const res = await authApi.forgotPassword({ email: trimmed })
      setMessage(res.message)
      setEmail('')
    } catch (err) {
      setError(getErrorMessage(err, AUTH_MESSAGES.forgotPassword.submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthPageShell
      title={AUTH_MESSAGES.forgotPassword.title}
      description={AUTH_MESSAGES.forgotPassword.description}
      footer={
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 rotate-180" />
          {AUTH_MESSAGES.common.backToLogin}
        </Link>
      }
    >
      {message ? (
        <div aria-live="polite">
          <Alert variant="success" size="sm" message={message} className="rounded-xl" />
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <Input
            type="text"
            inputMode="email"
            label={AUTH_MESSAGES.common.emailLabel}
            placeholder="name@company.co.il"
            disabled={isSubmitting}
            autoComplete="email"
            error={error ?? undefined}
            startIcon={<Mail className="h-4 w-4" />}
            className="rounded-xl border-slate-200 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:ring-slate-900/20 disabled:bg-slate-50"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError(null)
            }}
          />

          <Button
            type="submit"
            icon={<Send className="h-4 w-4" />}
            iconPosition="end"
            isLoading={isSubmitting}
            loadingLabel={AUTH_MESSAGES.forgotPassword.loading}
            fullWidth
            className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
          >
            <span>{AUTH_MESSAGES.forgotPassword.submit}</span>
          </Button>
        </form>
      )}
    </AuthPageShell>
  )
}
