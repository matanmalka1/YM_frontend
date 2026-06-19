import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { Input } from '../../../../components/ui/inputs/Input'
import { Button } from '../../../../components/ui/primitives/Button'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../../schemas'
import type { UserResponse } from '../../api'

interface ResetPasswordModalProps {
  open: boolean
  user: UserResponse | null
  onClose: () => void
  onSubmit: (userId: number, newPassword: string) => Promise<void>
  isLoading?: boolean
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  user,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
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
      title={`איפוס סיסמה — ${user?.full_name ?? ''}`}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            ביטול
          </Button>
          <Button variant="danger" onClick={onFormSubmit} isLoading={isLoading}>
            אפס סיסמה
          </Button>
        </div>
      }
    >
      <form onSubmit={onFormSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">הזן סיסמה חדשה עבור המשתמש. הסיסמה חייבת להכיל לפחות 8 תווים.</p>
        <Input
          label="סיסמה חדשה *"
          type="password"
          {...register('new_password')}
          error={errors.new_password?.message}
          placeholder="לפחות 8 תווים"
        />
        <Input
          label="אימות סיסמה *"
          type="password"
          {...register('confirm_password')}
          error={errors.confirm_password?.message}
          placeholder="הקלד שוב את הסיסמה"
        />
      </form>
    </Modal>
  )
}
