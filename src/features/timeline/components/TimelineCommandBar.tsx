import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { Filter, RefreshCw, Search, Star, X } from 'lucide-react'
import { Button } from '../../../components/ui/primitives/Button'
import { Input } from '../../../components/ui/inputs/Input'
import { cn, formatCount } from '../../../utils/utils'
import { useSearchDebounce } from '../../../hooks/useSearchDebounce'
import type { EventTypeStat } from '../lib/timelineStats'
import type { TimelineFilterKey } from '../normalize'
import { TIMELINE_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TimelineCommandBarProps {
  total: number
  hasActiveFilters: boolean
  lastEventTimestamp: string | null
  refreshing: boolean
  onRefresh: () => void
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilters: TimelineFilterKey[]
  onToggleTypeFilter: (type: TimelineFilterKey) => void
  importantOnly: boolean
  onImportantOnlyChange: (value: boolean) => void
  onClearFilters: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  eventTypeStats: EventTypeStat[]
}

const FILTER_LABELS: Record<TimelineFilterKey, string> = {
  all: 'הכל',
  past: 'עבר',
  future: 'עתידי',
  finance: 'כספים',
  binders: 'קלסרים',
  documents: 'מסמכים',
  tax: 'מיסים',
}

const FILTER_ORDER: TimelineFilterKey[] = ['all', 'future', 'finance', 'binders', 'documents', 'tax']

const getFilterCount = (stats: EventTypeStat[], key: TimelineFilterKey): number =>
  stats.find((stat) => stat.type === key)?.count ?? 0

// ── Component ─────────────────────────────────────────────────────────────────

export const TimelineCommandBar: React.FC<TimelineCommandBarProps> = ({
  total,
  hasActiveFilters,
  lastEventTimestamp,
  refreshing,
  onRefresh,
  searchTerm,
  onSearchChange,
  typeFilters,
  onToggleTypeFilter,
  importantOnly,
  onImportantOnlyChange,
  onClearFilters,
  onExpandAll,
  onCollapseAll,
  eventTypeStats,
}) => {
  const [localSearch, setLocalSearch] = useSearchDebounce(searchTerm, onSearchChange)
  const lastUpdated = lastEventTimestamp ? format(parseISO(lastEventTimestamp), 'd MMM HH:mm', { locale: he }) : null

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white overflow-hidden">
      {/* ── Top row: search + controls ── */}
      <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center border-b border-gray-100">
        {/* Search */}
        <div className="flex-1 relative">
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={TIMELINE_SEARCH_PLACEHOLDER}
            startIcon={<Search className="h-4 w-4" />}
            className="py-2 text-sm bg-gray-50 focus:bg-white"
          />
          {localSearch && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalSearch('')
                onSearchChange('')
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 hover:bg-transparent"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-gray-400 whitespace-nowrap">{formatCount(total)} אירועים</span>

          {lastUpdated && (
            <span className="hidden md:block text-xs text-gray-400 whitespace-nowrap">
              עודכן לאחרונה: {lastUpdated}
            </span>
          )}

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={refreshing}
            className="gap-1.5 text-gray-600 hover:text-gray-900"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ריענון</span>
          </Button>
        </div>
      </div>

      {/* ── Bottom row: filter chips ── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 ml-1">
          <Filter className="h-3 w-3" />
          סנן:
        </span>

        {FILTER_ORDER.map((type) => {
          const count = getFilterCount(eventTypeStats, type)
          if (type === 'future' && count === 0) return null
          const isActive = typeFilters.includes(type)
          return (
            <button
              key={type}
              type="button"
              onClick={() => onToggleTypeFilter(type)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                'transition-all duration-150 border',
                isActive
                  ? 'bg-primary-100 text-primary-800 border-primary-300 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100',
              )}
            >
              {FILTER_LABELS[type]}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                    isActive ? 'bg-white/50' : 'bg-gray-200 text-gray-600',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onImportantOnlyChange(!importantOnly)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            'transition-all duration-150 border',
            importantOnly
              ? 'bg-warning-100 text-warning-800 border-warning-300 shadow-sm'
              : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-100',
          )}
        >
          <Star className={cn('h-3 w-3', importantOnly ? 'fill-amber-500 text-warning-500' : 'text-gray-400')} />
          חשובים בלבד
        </button>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-negative-600 hover:bg-negative-50 hover:text-negative-600 px-2.5 py-1 rounded-full border border-transparent hover:border-negative-200"
          >
            <X className="h-3 w-3" />
            נקה
          </Button>
        )}

        <div className="mr-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onExpandAll}
            className="text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1 rounded-full"
          >
            פתח הכל
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCollapseAll}
            className="text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1 rounded-full"
          >
            כווץ הכל
          </Button>
        </div>
      </div>
    </div>
  )
}

TimelineCommandBar.displayName = 'TimelineCommandBar'
