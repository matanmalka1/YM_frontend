import type { ReactNode } from 'react'
import { Loader2, X } from 'lucide-react'
import { cn } from '../../../utils/utils'

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
  clearLabel = 'נקה בחירה',
  extra,
  loading,
  onClear,
  selectedCount,
}) => (
  <div
    dir="rtl"
    className="animate-fade-in rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3 flex flex-col gap-3"
  >
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 border border-primary-200 px-3 py-1 text-xs font-semibold text-primary-700 tabular-nums">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
        {selectedCount} נבחרו
      </span>

      <div className="h-4 w-px bg-primary-200" />

      <div className="flex flex-wrap items-center gap-2">{children}</div>

      <div className="mr-auto">
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 disabled:opacity-40"
        >
          <X className="h-3 w-3" />
          {clearLabel}
        </button>
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
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
      variant === 'danger'
        ? 'border-negative-200 bg-white text-negative-600 hover:bg-negative-50 hover:border-negative-300 active:bg-negative-100'
        : 'border-primary-200 bg-white text-primary-700 hover:bg-primary-50 hover:border-primary-300 active:bg-primary-100',
    )}
  >
    {loading && <Loader2 className="h-3 w-3 animate-spin" />}
    {label}
  </button>
)
