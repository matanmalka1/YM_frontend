import { Modal } from '../../../components/ui/overlays/Modal'
import { Button } from '../../../components/ui/primitives/Button'
import { type AuthorityContactResponse } from '../api'
import { AUTHORITY_CONTACT_TEXT } from '../constants'
import { useAuthorityContactForm } from '../hooks/useAuthorityContactForm'
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
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" disabled={isSaving} onClick={onClose}>
            {AUTHORITY_CONTACT_TEXT.cancel}
          </Button>
          <Button type="submit" form={formId} isLoading={isSaving} loadingLabel={AUTHORITY_CONTACT_TEXT.saving}>
            {existing ? AUTHORITY_CONTACT_TEXT.editSubmit : AUTHORITY_CONTACT_TEXT.createSubmit}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        <AuthorityContactFormFields form={form} />
      </form>
    </Modal>
  )
}
