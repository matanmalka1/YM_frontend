import { OverlayContainer } from '../layout/OverlayContainer'
import { UnsavedChangesGuard } from '../feedback/UnsavedChangesGuard'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'

interface ModalProps {
  open: boolean
  title: React.ReactNode
  children: React.ReactNode
  footer: React.ReactNode
  onClose: () => void
  className?: string
  /** When true, closing shows a confirmation prompt before discarding */
  isDirty?: boolean
}

export const Modal: React.FC<ModalProps> = ({ open, title, children, footer, onClose, className, isDirty = false }) => {
  const { showGuard, handleClose, handleContinue, handleDiscard } = useUnsavedChangesGuard({
    isDirty,
    onClose,
  })

  return (
    <>
      <OverlayContainer
        open={open}
        variant="modal"
        title={title}
        footer={footer}
        onClose={handleClose}
        className={className}
      >
        {children}
      </OverlayContainer>

      {showGuard && <UnsavedChangesGuard onContinue={handleContinue} onDiscard={handleDiscard} />}
    </>
  )
}

Modal.displayName = 'Modal'
