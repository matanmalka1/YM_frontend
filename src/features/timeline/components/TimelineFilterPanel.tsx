import { GLOBAL_UI_MESSAGES } from '@/messages'
import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import { Button } from '@/components/ui/primitives/Button'
import { TIMELINE_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { formatCount } from '@/utils/utils'
import { TIMELINE_MESSAGES } from '../messages'

const TIMELINE_FILTER_FIELDS = [
  {
    type: 'search',
    key: 'search',
    label: GLOBAL_UI_MESSAGES.common.search,
    placeholder: TIMELINE_SEARCH_PLACEHOLDER,
    fullWidth: true,
  },
  {
    type: 'toggle',
    key: 'type_filters',
    label: TIMELINE_MESSAGES.filterPanel.eventTypeLabel,
    fullWidth: true,
    options: [
      { value: 'finance', label: TIMELINE_MESSAGES.filterPanel.filterFinance },
      { value: 'binders', label: TIMELINE_MESSAGES.filterPanel.filterBinders },
      { value: 'documents', label: TIMELINE_MESSAGES.filterPanel.filterDocuments },
      { value: 'tax', label: TIMELINE_MESSAGES.filterPanel.filterTax },
    ],
  },
  {
    type: 'toggle',
    key: 'important_only',
    label: TIMELINE_MESSAGES.filterPanel.importanceLabel,
    options: [{ value: 'true', label: TIMELINE_MESSAGES.filterPanel.importantOnly }],
  },
] satisfies FilterFieldDef[]

interface TimelineFilterPanelProps {
  total: number
  lastEventTimestamp: string | null
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilters: string[]
  onTypeFiltersChange: (value: string) => void
  importantOnly: boolean
  onImportantOnlyChange: (value: boolean) => void
  onClearFilters: () => void
  allExpanded: boolean
  onToggleExpandAll: () => void
}

export const TimelineFilterPanel: React.FC<TimelineFilterPanelProps> = ({
  total,
  lastEventTimestamp,
  searchTerm,
  onSearchChange,
  typeFilters,
  onTypeFiltersChange,
  importantOnly,
  onImportantOnlyChange,
  onClearFilters,
  allExpanded,
  onToggleExpandAll,
}) => {
  const lastUpdated = lastEventTimestamp ? format(parseISO(lastEventTimestamp), 'd MMM HH:mm', { locale: he }) : null

  const handleChange = (key: string, value: string) => {
    if (key === 'search') return onSearchChange(value)
    if (key === 'type_filters') return onTypeFiltersChange(value)
    if (key === 'important_only') return onImportantOnlyChange(value === 'true')
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-700">
          {TIMELINE_MESSAGES.filterPanel.eventsCount(formatCount(total))}
        </p>
        {lastUpdated ? (
          <p className="text-xs text-gray-500">{TIMELINE_MESSAGES.filterPanel.lastUpdated(lastUpdated)}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={
            allExpanded ? (
              <ChevronsDownUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
            )
          }
          onClick={onToggleExpandAll}
        >
          {allExpanded ? GLOBAL_UI_MESSAGES.actions.collapseAll : GLOBAL_UI_MESSAGES.actions.expandAll}
        </Button>
        <FilterPanel
          fields={TIMELINE_FILTER_FIELDS}
          values={{
            search: searchTerm,
            type_filters: typeFilters.join(','),
            important_only: importantOnly ? 'true' : '',
          }}
          onChange={handleChange}
          onReset={onClearFilters}
          title={GLOBAL_UI_MESSAGES.filters.title}
          subtitle={TIMELINE_MESSAGES.filterPanel.subtitle}
        />
      </div>
    </div>
  )
}

TimelineFilterPanel.displayName = 'TimelineFilterPanel'
