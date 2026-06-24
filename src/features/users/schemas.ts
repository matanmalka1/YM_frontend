import { z } from 'zod'
import { USER_ROLE_VALUES } from './constants'
import { passwordSchema } from '@/utils/passwordSchema'
import { USERS_ERROR_MESSAGES } from './errorMessages'

// ── Shared field validators ────────────────────────────────────────────────────

const fullNameField = z
  .string()
  .trim()
  .min(2, USERS_ERROR_MESSAGES.form.fullNameMin)
  .max(50, USERS_ERROR_MESSAGES.form.fullNameMax)

const emailField = z.string().trim().email(USERS_ERROR_MESSAGES.form.invalidEmail)

const phoneField = z
  .string()
  .trim()
  .regex(/^0\d{1,2}-?\d{7}$/, USERS_ERROR_MESSAGES.form.invalidPhone)
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
    message: USERS_ERROR_MESSAGES.form.passwordsMismatch,
    path: ['confirm_password'],
  })

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
