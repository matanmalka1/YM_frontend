import { z } from 'zod'
import { USER_ROLE_VALUES } from './constants'
import { passwordSchema } from '@/utils/passwordSchema'

// ── Shared field validators ────────────────────────────────────────────────────

const fullNameField = z.string().trim().min(2, 'שם מלא חייב להכיל לפחות 2 תווים').max(50, 'שם מלא ארוך מדי')

const emailField = z.string().trim().email('כתובת אימייל לא תקינה')

const phoneField = z
  .string()
  .trim()
  .regex(/^0\d{1,2}-?\d{7}$/, 'מספר טלפון לא תקין')
  .optional()
  .or(z.literal(''))

const roleField = z.enum(USER_ROLE_VALUES)

// ── Schemas ───────────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  full_name: fullNameField,
  email: emailField,
  phone: phoneField,
  role: roleField,
  password: passwordSchema,
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const editUserSchema = z.object({
  full_name: fullNameField,
  email: emailField,
  phone: phoneField,
  role: roleField,
})

export type EditUserFormValues = z.infer<typeof editUserSchema>

export const resetPasswordSchema = z
  .object({
    new_password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'הסיסמאות אינן תואמות',
    path: ['confirm_password'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
