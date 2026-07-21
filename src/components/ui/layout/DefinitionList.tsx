import { cn } from '../../../utils/utils'

export interface DefinitionItem {
  label: string
  value: React.ReactNode
  fullWidth?: boolean
}

export interface DefinitionListProps {
  items: DefinitionItem[]
  columns?: 1 | 2 | 3 | 4 | 5
  /**
   * grid    — label above value in a responsive grid (DescriptionList style)
   * stacked — label + value as a horizontal row with a divider border (drawer detail style)
   * inline  — compact "label value" pairs sharing a baseline that wrap (metadata strip style)
   */
  layout?: 'grid' | 'stacked' | 'inline'
  /** Rendered when an item's value is null/undefined/empty-string (default: "—"). */
  emptyValue?: React.ReactNode
  /** Extra classes applied to every value (<dd>) cell. */
  valueClassName?: string
  className?: string
}

/** Treat null, undefined and empty string as "no value". Keeps falsy 0/false visible. */
const isEmpty = (value: React.ReactNode) => value == null || value === ''

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
}

export const DefinitionList: React.FC<DefinitionListProps> = ({
  items,
  columns = 2,
  layout = 'grid',
  emptyValue = '—',
  valueClassName,
  className,
}) => {
  if (layout === 'inline') {
    return (
      <dl className={cn('flex flex-wrap items-baseline gap-x-5 gap-y-1.5', className)}>
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className={cn('flex min-w-0 items-baseline gap-1.5 text-xs', item.fullWidth && 'basis-full')}
          >
            <dt className="shrink-0 text-gray-400">{item.label}</dt>
            <dd className={cn('min-w-0 break-words font-medium text-gray-700', valueClassName)}>
              {isEmpty(item.value) ? emptyValue : item.value}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  if (layout === 'stacked') {
    return (
      <dl className={className}>
        {items.map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0"
          >
            <dt className="text-sm text-gray-500 shrink-0">{item.label}</dt>
            <dd className={cn('text-sm text-gray-900 text-start font-medium', valueClassName)}>
              {isEmpty(item.value) ? emptyValue : item.value}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return (
    <dl className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className={cn('space-y-1', item.fullWidth && columns > 1 && 'col-span-full')}>
          <dt className="text-xs font-medium text-gray-500">{item.label}</dt>
          <dd className={cn('text-sm font-medium text-gray-900', valueClassName)}>
            {isEmpty(item.value) ? emptyValue : item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

DefinitionList.displayName = 'DefinitionList'
