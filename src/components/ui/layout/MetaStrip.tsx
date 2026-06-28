import { cn } from '../../../utils/utils'

/**
 * Quiet, inline metadata strip for detail-page headers: a row of icon + label +
 * value items separated by whitespace (no boxed badges) so the title, status and
 * primary actions stay visually dominant. Shared across feature detail headers.
 */
export const MetaStrip: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500', className)}>
    {children}
  </div>
)

MetaStrip.displayName = 'MetaStrip'

interface MetaItemProps {
  icon: React.ReactNode
  label?: string
  children: React.ReactNode
}

export const MetaItem: React.FC<MetaItemProps> = ({ icon, label, children }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="shrink-0 text-gray-400">{icon}</span>
    {label && <span className="text-gray-400">{label}</span>}
    <span className="font-medium text-gray-700">{children}</span>
  </span>
)

MetaItem.displayName = 'MetaItem'
