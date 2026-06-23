import { cn } from '@/utils/utils'

type DismissBackdropPlacement = 'mobileBelowHeader'

interface DismissBackdropProps {
  open: boolean
  onDismiss: () => void
  ariaLabel: string
  placement?: DismissBackdropPlacement
}

const placementClasses: Record<DismissBackdropPlacement, string> = {
  mobileBelowHeader: 'fixed inset-x-0 bottom-0 top-16 z-40 md:hidden',
}

export const DismissBackdrop: React.FC<DismissBackdropProps> = ({
  open,
  onDismiss,
  ariaLabel,
  placement = 'mobileBelowHeader',
}) => (
  <button
    type="button"
    onClick={onDismiss}
    className={cn(
      placementClasses[placement],
      'bg-black/20 transition-opacity',
      open ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0',
    )}
    aria-label={ariaLabel}
    tabIndex={open ? 0 : -1}
  />
)
