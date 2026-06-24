import { OverlayContainer } from '../layout/OverlayContainer'
import { UnsavedChangesGuard } from '../feedback/UnsavedChangesGuard'
import { useUnsavedChangesGuard } from './useUnsavedChangesGuard'
import { OverlayDismissContext } from './useOverlayDismiss'

interface DetailDrawerProps {
  open: boolean
  title: React.ReactNode
  subtitle?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  isDirty?: boolean
  className?: string
}

export const DetailDrawer: React.FC<DetailDrawerProps> = ({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  isDirty = false,
  className,
}) => {
  const { showGuard, handleClose, handleContinue, handleDiscard } = useUnsavedChangesGuard({
    isDirty,
    onClose,
  })

  return (
    <OverlayDismissContext.Provider value={handleClose}>
      <OverlayContainer
        open={open}
        variant="drawer"
        title={title}
        subtitle={subtitle}
        footer={footer}
        onClose={handleClose}
        className={className}
      >
        {children}
      </OverlayContainer>

      {showGuard && <UnsavedChangesGuard onContinue={handleContinue} onDiscard={handleDiscard} />}
    </OverlayDismissContext.Provider>
  )
}
DetailDrawer.displayName = 'DetailDrawer'
