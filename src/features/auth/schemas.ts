import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'יש להזין דוא״ל').email('כתובת דוא״ל לא תקינה'),
  password: z.string().min(1, 'יש להזין סיסמה'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const loginDefaultValues: LoginFormValues = {
  email: '',
  password: '',
}

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, 'יש להזין דוא״ל').email('כתובת דוא״ל לא תקינה'),
})

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const forgotPasswordDefaultValues: ForgotPasswordFormValues = {
  email: '',
}

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'יש להזין סיסמה חדשה')
      .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
      .max(128, 'הסיסמה ארוכה מדי')
      .regex(/[A-Z]/, 'הסיסמה חייבת להכיל לפחות אות גדולה באנגלית')
      .regex(/[a-z]/, 'הסיסמה חייבת להכיל לפחות אות קטנה באנגלית')
      .regex(/[^a-zA-Z0-9]/, 'הסיסמה חייבת להכיל לפחות תו מיוחד אחד'),
    confirmPassword: z.string().min(1, 'יש לאשר את הסיסמה'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'הסיסמאות אינן תואמות',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const resetPasswordDefaultValues: ResetPasswordFormValues = {
  newPassword: '',
  confirmPassword: '',
}
