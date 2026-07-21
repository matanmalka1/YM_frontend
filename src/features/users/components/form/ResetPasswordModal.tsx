import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Input } from '../../../../components/ui/inputs/Input'
import { Button } from '../../../../components/ui/primitives/Button'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../../schemas'
import type { UserResponse } from '../../api'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { USERS_MESSAGES } from '../../messages'

interface ResetPasswordModalProps {
  open: boolean
  user: UserResponse | null
  onClose: () => void
  onSubmit: (userId: number, newPassword: string) => Promise<void>
  isLoading?: boolean
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ open, user, onClose, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  const onFormSubmit = handleSubmit(async (data) => {
    if (!user) return
    await onSubmit(user.id, data.new_password)
    reset()
    onClose()
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={USERS_MESSAGES.resetPassword.title(user?.full_name ?? '')}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {GLOBAL_UI_MESSAGES.actions.cancel}
          </Button>
          <Button variant="danger" onClick={onFormSubmit} isLoading={isLoading}>
            {USERS_MESSAGES.resetPassword.submit}
          </Button>
        </div>
      }
    >
      <form onSubmit={onFormSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">{USERS_MESSAGES.resetPassword.description}</p>
        <Input
          label={USERS_MESSAGES.resetPassword.newPassword}
          type="password"
          {...register('new_password')}
          error={errors.new_password?.message}
          placeholder={USERS_MESSAGES.form.passwordPlaceholder}
        />
        <Input
          label={USERS_MESSAGES.resetPassword.confirmPassword}
          type="password"
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
          placeholder={USERS_MESSAGES.resetPassword.confirmPasswordPlaceholder}
        />
      </form>
    </Modal>
  )
}
