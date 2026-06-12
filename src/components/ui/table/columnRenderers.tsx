import type { ReactNode } from 'react'
import { StatusBadge } from '../primitives/StatusBadge'
import { cn, formatDate } from '../../../utils/utils'
import type { StatusVariantMap, TableCellValue } from './columnTypes'

const EMPTY_VALUE = '—'

const isEmptyValue = (value: TableCellValue): value is null | undefined | '' => value == null || value === ''

interface TextRendererProps {
  value: TableCellValue
  className?: string
  emptyValue?: ReactNode
}

interface StatusRendererProps<TStatus extends string> {
  status: TStatus
  getLabel: (status: TStatus) => string
  variantMap: StatusVariantMap
  defaultVariant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

const renderEmptyFallback = (emptyValue: ReactNode = EMPTY_VALUE): ReactNode => emptyValue

export const renderMutedText = ({ value, className, emptyValue }: TextRendererProps): ReactNode => (
  <span className={cn('text-sm text-gray-700', className)}>
    {isEmptyValue(value) ? renderEmptyFallback(emptyValue) : value}
  </span>
)

export const renderMonoText = ({ value, className, emptyValue }: TextRendererProps): ReactNode => (
  <span className={cn('font-mono text-sm text-gray-700 tabular-nums', className)}>
    {isEmptyValue(value) ? renderEmptyFallback(emptyValue) : value}
  </span>
)

export const renderDateText = ({
  value,
  className,
  emptyValue,
}: {
  value: string | null | undefined
  className?: string
  emptyValue?: ReactNode
}): ReactNode => (
  <span className={cn('text-sm text-gray-600 tabular-nums', className)}>
    {value ? formatDate(value) : renderEmptyFallback(emptyValue)}
  </span>
)

export const renderStatusBadge = <TStatus extends string>({
  status,
  getLabel,
  variantMap,
  defaultVariant,
}: StatusRendererProps<TStatus>): ReactNode => (
  <StatusBadge
    status={status}
    // StatusBadge is intentionally non-generic for now; keep the cast at this boundary.
    getLabel={getLabel as (status: string) => string}
    variantMap={variantMap}
    defaultVariant={defaultVariant}
  />
)
