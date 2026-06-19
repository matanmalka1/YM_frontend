import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Modal } from '../../../../components/ui/overlays/Modal'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import { UserFormFields } from './UserFormFields'
import { editUserSchema, type EditUserFormValues } from '../../schemas'
import type { UserResponse, UpdateUserPayload } from '../../api'

interface EditUserModalProps {
  open: boolean
  user: UserResponse | null
  onClose: () => void
  onSubmit: (userId: number, payload: UpdateUserPayload) => Promise<void>
  isLoading?: boolean
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ open, user, onClose, onSubmit, isLoading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: { full_name: '', email: '', phone: '', role: 'secretary' },
  })

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone ?? '',
        role: user.role,
      })
    }
  }, [user, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onFormSubmit = handleSubmit(async (data) => {
    if (!user) return
    await onSubmit(user.id, {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      role: data.role,
    })
  })

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`עריכת משתמש — ${user?.full_name ?? ''}`}
      footer={
        <ModalFormActions
          isLoading={isLoading}
          submitLabel="שמור שינויים"
          onCancel={handleClose}
          onSubmit={onFormSubmit}
        />
      }
    >
      <form onSubmit={onFormSubmit}>
        <UserFormFields register={register} errors={errors} />
      </form>
    </Modal>
  )
}

EditUserModal.displayName = 'EditUserModal'
