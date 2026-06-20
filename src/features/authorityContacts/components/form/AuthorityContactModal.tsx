import { Modal } from '../../../../components/ui/overlays/Modal'
import { ModalFormActions } from '../../../../components/ui/overlays/ModalFormActions'
import { type AuthorityContactResponse } from '../../api'
import { AUTHORITY_CONTACT_TEXT } from '../../constants'
import { useAuthorityContactForm } from '../../hooks/useAuthorityContactForm'
import { AuthorityContactFormFields } from './AuthorityContactFormFields'

interface AuthorityContactModalProps {
  open: boolean
  clientId: number
  existing?: AuthorityContactResponse | null
  onClose: () => void
}

export const AuthorityContactModal: React.FC<AuthorityContactModalProps> = ({ open, clientId, existing, onClose }) => {
  const { form, onSubmit, isSaving } = useAuthorityContactForm(clientId, onClose, existing)
  const formId = 'authority-contact-form'

  return (
    <Modal
      open={open}
      title={existing ? AUTHORITY_CONTACT_TEXT.editTitle : AUTHORITY_CONTACT_TEXT.createTitle}
      onClose={onClose}
      isDirty={form.formState.isDirty}
      footer={
        <ModalFormActions
          cancelLabel={AUTHORITY_CONTACT_TEXT.cancel}
          isLoading={isSaving}
          submitType="submit"
          submitForm={formId}
          submitLabel={existing ? AUTHORITY_CONTACT_TEXT.editSubmit : AUTHORITY_CONTACT_TEXT.createSubmit}
        />
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        <AuthorityContactFormFields form={form} />
      </form>
    </Modal>
  )
}
