import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../primitives/Button'
import { Divider } from '../../primitives/Divider'
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
  <div className="animate-fade-in rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3 flex flex-col gap-3">
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-700 tabular-nums">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
        {selectedCount} נבחרו
      </span>

      <Divider orientation="vertical" className="h-4 bg-primary-200" />

      <div className="flex flex-wrap items-center gap-2">{children}</div>

      <div className="ms-auto">
        <Button variant="ghost" size="xs" icon={<X className="h-3 w-3" />} onClick={onClear} disabled={loading}>
          {clearLabel}
        </Button>
      </div>
    </div>

    {extra && <div className="border-t border-primary-200/70 pt-3">{extra}</div>}
  </div>
)

interface BulkSelectionActionButtonProps {
  disabled: boolean
  label: string
  loading: boolean
  onClick: () => void
  variant?: 'default' | 'danger'
}

export const BulkSelectionActionButton: React.FC<BulkSelectionActionButtonProps> = ({
  disabled,
  label,
  loading,
  onClick,
  variant = 'default',
}) => (
  <Button
    variant={variant === 'danger' ? 'danger' : 'outline'}
    size="xs"
    onClick={onClick}
    disabled={disabled}
    isLoading={loading}
  >
    {label}
  </Button>
)
