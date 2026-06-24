import { z } from 'zod'
import { AUTH_MESSAGES } from './messages'

export const loginSchema = z.object({
  email: z.string().trim().min(1, AUTH_MESSAGES.validation.emailRequired).email(AUTH_MESSAGES.validation.invalidEmail),
  password: z.string().min(1, AUTH_MESSAGES.validation.passwordRequired),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const loginDefaultValues: LoginFormValues = {
  email: '',
  password: '',
}
