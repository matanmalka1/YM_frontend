import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../primitives/Button'
import { GLOBAL_UI_MESSAGES } from '../../../../messages'

interface BulkSelectionToolbarProps {
  children: ReactNode
  clearLabel?: string
  extra?: ReactNode
  loading: boolean
  onClear: () => void
  selectedCount: number
}

export const BulkSelectionToolbar: React.FC<BulkSelectionToolbarProps> = ({
  children,
  clearLabel = GLOBAL_UI_MESSAGES.actions.clearSelection,
  extra,
  loading,
  onClear,
  selectedCount,
}) => (
  <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
    <div className="animate-fade-in pointer-events-auto flex max-w-full flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2.5 shadow-xl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="ps-2 pe-1 text-sm font-semibold text-gray-900 tabular-nums">{selectedCount} נבחרו</span>

        <Button
          variant="ghost"
          size="xs"
          shape="square"
          icon={<X className="h-4 w-4" />}
          onClick={onClear}
          disabled={loading}
          aria-label={clearLabel}
          className="text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        />

        <div className="flex flex-wrap items-center gap-2">{children}</div>
      </div>

      {extra && <div className="border-t border-gray-200 pt-3">{extra}</div>}
    </div>
  </div>
)

interface BulkSelectionActionButtonProps {
  disabled: boolean
  label: string
  loading: boolean
  onClick: () => void
  variant?: 'default' | 'primary' | 'danger'
}

const actionButtonStyles: Record<NonNullable<BulkSelectionActionButtonProps['variant']>, string> = {
  default: 'rounded-xl bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
  primary: 'rounded-xl bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  danger: 'rounded-xl bg-negative-600 text-white hover:bg-negative-700 active:bg-negative-800',
}

export const BulkSelectionActionButton: React.FC<BulkSelectionActionButtonProps> = ({
  disabled,
  label,
  loading,
  onClick,
  variant = 'default',
}) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    isLoading={loading}
    className={actionButtonStyles[variant]}
  >
    {label}
  </Button>
)
