import type { AnchorHTMLAttributes } from 'react'
import { DropdownMenu, DropdownMenuItem } from '../overlays/DropdownMenu'

interface RowActionsMenuProps {
  ariaLabel?: string
  children: React.ReactNode
  title?: string
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({ ariaLabel, children, title }) => (
  <div className="flex justify-center">
    <DropdownMenu ariaLabel={ariaLabel ?? 'פעולות'} title={title}>
      {children}
    </DropdownMenu>
  </div>
)

RowActionsMenu.displayName = 'RowActionsMenu'

export const RowActionItem = DropdownMenuItem

export const RowActionSeparator = () => <div className="my-1 border-t border-gray-100" />

RowActionSeparator.displayName = 'RowActionSeparator'

interface RowActionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  label: string
  icon: React.ReactNode
}

export const RowActionLink: React.FC<RowActionLinkProps> = ({ href, label, icon, className, onClick, ...props }) => (
  <a
    href={href}
    className={
      className ?? 'block w-full px-3 py-2 text-right text-sm text-gray-700 transition-colors hover:bg-gray-50'
    }
    onClick={(event) => {
      event.stopPropagation()
      onClick?.(event)
    }}
    onKeyDown={(event) => event.stopPropagation()}
    {...props}
  >
    <span className="grid w-full grid-cols-[minmax(0,1fr)_1rem] items-center gap-2">
      <span className="truncate">{label}</span>
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
    </span>
  </a>
)

RowActionLink.displayName = 'RowActionLink'
