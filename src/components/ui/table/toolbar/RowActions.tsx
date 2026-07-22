import type { AnchorHTMLAttributes } from 'react'
import { Children, Fragment, isValidElement } from 'react'
import { cn } from '../../../../utils/utils'
import { Menu, MenuItem } from '../../overlays/Menu'
import { Tooltip } from '../../primitives/Tooltip'
import { GLOBAL_UI_MESSAGES } from '../../../../messages'

const hasRenderableContent = (node: React.ReactNode): boolean =>
  Children.toArray(node).some((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return hasRenderableContent((child.props as { children?: React.ReactNode }).children)
    }
    return true
  })

interface RowActionGroupProps {
  children: React.ReactNode
}

export const RowActionGroup: React.FC<RowActionGroupProps> = ({ children }) => <>{children}</>

RowActionGroup.displayName = 'RowActionGroup'

interface RowActionsMenuProps {
  ariaLabel?: string
  children: React.ReactNode
  title?: string
  menuClassName?: string
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({ ariaLabel, children, title, menuClassName }) => {
  const allChildren = Children.toArray(children)
  const groups = allChildren.filter(
    (child): child is React.ReactElement<RowActionGroupProps> => isValidElement(child) && child.type === RowActionGroup,
  )
  // Grouped separator rendering assumes every child is a RowActionGroup. All current callers
  // wrap every child in a group, so non-group children are only rendered when no group is used
  // at all (plain children passthrough, e.g. ClientRowActions/BinderRowActions/ChargeRowActions).
  const isGrouped = groups.length > 0 && groups.length === allChildren.length
  const visibleGroups = isGrouped ? groups.filter((group) => hasRenderableContent(group.props.children)) : []

  return (
    <div className="flex justify-center">
      <Menu ariaLabel={ariaLabel ?? GLOBAL_UI_MESSAGES.common.actions} title={title} menuClassName={menuClassName}>
        {isGrouped
          ? visibleGroups.map((group, index) => (
              <Fragment key={group.key ?? index}>
                {index > 0 && <RowActionSeparator />}
                {group.props.children}
              </Fragment>
            ))
          : children}
      </Menu>
    </div>
  )
}

RowActionsMenu.displayName = 'RowActionsMenu'

export const RowActionItem = MenuItem

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
    role="menuitem"
    tabIndex={-1}
    className={className ?? 'block w-full px-3 py-2 text-right text-sm text-gray-700 transition-colors hover:bg-gray-50'}
    onClick={(event) => {
      event.stopPropagation()
      onClick?.(event)
    }}
    onKeyDown={(event) => {
      event.stopPropagation()
    }}
    {...props}
  >
    <span className="grid w-full grid-cols-[minmax(0,1fr)_1rem] items-center gap-2">
      <span className="truncate">{label}</span>
      <span className="flex h-4 w-4 items-center justify-center">{icon}</span>
    </span>
  </a>
)

RowActionLink.displayName = 'RowActionLink'

type RowActionTone = 'neutral' | 'primary' | 'info' | 'positive' | 'danger'

const rowActionToneClasses: Record<RowActionTone, string> = {
  neutral: 'text-gray-400 hover:bg-gray-100 hover:text-gray-700',
  primary: 'text-primary-400 hover:bg-primary-50 hover:text-primary-600',
  info: 'text-info-400 hover:bg-info-50 hover:text-info-600',
  positive: 'text-positive-500 hover:bg-positive-50 hover:text-positive-700',
  danger: 'text-negative-600 hover:bg-negative-50 hover:text-negative-700',
}

const rowActionSizeClasses = { sm: 'h-6 w-6', md: 'h-8 w-8' } as const

interface RowActionButtonProps {
  label: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  /** Semantic colour. Defaults to `neutral` (or `danger` if the legacy `danger` flag is set). */
  tone?: RowActionTone
  /** `sm` (h-6) for dense / inline-edit rows; `md` (h-8, default) for standard tables. */
  size?: 'sm' | 'md'
  /** @deprecated use `tone="danger"`. */
  danger?: boolean
  className?: string
}

export const RowActionButton: React.FC<RowActionButtonProps> = ({
  label,
  icon,
  onClick,
  disabled = false,
  tone,
  size = 'md',
  danger = false,
  className,
}) => {
  const resolvedTone = tone ?? (danger ? 'danger' : 'neutral')
  const button = (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.stopPropagation()
        }
      }}
      className={cn(
        'focus-ring inline-flex items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        rowActionSizeClasses[size],
        rowActionToneClasses[resolvedTone],
        className,
      )}
    >
      {icon}
    </button>
  )
  return <Tooltip text={label}>{button}</Tooltip>
}

RowActionButton.displayName = 'RowActionButton'
