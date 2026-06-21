import { cn } from '../../../utils/utils'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

/**
 * Hairline separator between content/controls. Defaults to a horizontal full-width rule;
 * `orientation="vertical"` gives a 1px column (give it a height or rely on `self-stretch`).
 * Override colour/height/visibility via `className`.
 */
export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className }) => (
  <div
    role="separator"
    aria-orientation={orientation}
    className={cn(orientation === 'vertical' ? 'w-px self-stretch bg-gray-200' : 'h-px w-full bg-gray-200', className)}
  />
)

Divider.displayName = 'Divider'
