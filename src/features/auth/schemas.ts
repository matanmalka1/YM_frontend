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
