import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'

import { authApi } from '@/api/auth.api'
import { Alert } from '@/components/ui/overlays/Alert'
import { Input } from '@/components/ui/inputs/Input'
import { Button } from '@/components/ui/primitives/Button'
import { getErrorMessage } from '@/utils/utils'
import {
  forgotPasswordDefaultValues,
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas'
import { AuthPageShell } from '@/features/auth/components/AuthPageShell'

export const ForgotPassword: React.FC = () => {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: forgotPasswordDefaultValues,
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setMessage(null)
    setIsSubmitting(true)
    try {
      const response = await authApi.forgotPassword({ email: values.email })
      setMessage(response.message)
    } catch (err) {
      setError(getErrorMessage(err, 'לא ניתן לשלוח קישור איפוס כרגע. נסה שוב.'))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthPageShell
      title="שכחתי סיסמה"
      description="הזן את כתובת הדוא״ל שלך ונשלח קישור מאובטח לאיפוס הסיסמה אם החשבון קיים."
      footer={
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 rotate-180" />
          חזרה להתחברות
        </Link>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Input
          type="text"
          inputMode="email"
          label="כתובת דוא״ל"
          placeholder="name@company.co.il"
          disabled={isSubmitting || Boolean(message)}
          autoComplete="email"
          error={errors.email?.message}
          startIcon={<Mail className="h-4 w-4" />}
          className="rounded-xl border-slate-200 py-3 text-sm text-slate-900 placeholder:text-slate-300 focus:border-slate-400 focus:ring-slate-900/20 disabled:bg-slate-50"
          {...register('email')}
        />

        <div aria-live="polite">
          {message ? (
            <Alert variant="success" size="sm" message={message} className="rounded-xl" />
          ) : error ? (
            <Alert variant="error" size="sm" message={error} className="rounded-xl" />
          ) : null}
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={Boolean(message)}
          loadingLabel="שולחים..."
          fullWidth
          className="rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 focus:ring-slate-900 active:scale-[0.98]"
        >
          <span>שליחת קישור איפוס</span>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </AuthPageShell>
  )
}
