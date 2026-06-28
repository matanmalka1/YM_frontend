import { GLOBAL_UI_MESSAGES } from '@/messages'
import { RotateCcw, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import { Button } from '../../../components/ui/primitives/Button'
import { Badge } from '@/components/ui/primitives/Badge'
import { ClientPickerField, useClientPickerState } from '@/components/shared/client'
import { CLIENT_STATUS_OPTIONS, ENTITY_TYPE_OPTIONS } from '@/features/clients'
import { DOCUMENT_FILENAME_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import { BINDER_CAPACITY_STATUS_OPTIONS, BINDER_LOCATION_STATUS_OPTIONS } from '../../binders'
import { SEARCH_ADVANCED_FILTER_KEYS, type SearchFiltersBarProps } from '../types'
import { SEARCH_MESSAGES } from '../messages'

const withEmptyOption = (label: string, options: { value: string; label: string }[]) => [
  { value: '', label },
  ...options,
]

export const SearchFiltersBar: React.FC<SearchFiltersBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  isOpen,
  onToggle,
}) => {
  const advancedCount = SEARCH_ADVANCED_FILTER_KEYS.filter((k) => Boolean(filters[k])).length
  const { clientQuery, selectedClient, handleSelectClient, handleClearClient, handleClientQueryChange } =
    useClientPickerState({
      onSelect: (client) => onFilterChange('client_record_id', String(client.id)),
      onClear: () => onFilterChange('client_record_id', ''),
    })
  const activeClient =
    selectedClient ??
    (filters.client_record_id
      ? { id: Number(filters.client_record_id), name: SEARCH_MESSAGES.filters.clientFallback(filters.client_record_id) }
      : null)

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={<SlidersHorizontal className="h-4 w-4" />}
        onClick={onToggle}
        className="text-gray-600 hover:text-gray-900"
      >
        {SEARCH_MESSAGES.filters.advanced}
        {advancedCount > 0 && (
          <Badge variant="primary" size="3xs">
            {advancedCount}
          </Badge>
        )}
        {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>

      {isOpen && (
        <div className="mt-3 space-y-4 border-t border-gray-100 pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <ClientPickerField
              selectedClient={activeClient}
              clientQuery={clientQuery}
              onQueryChange={handleClientQueryChange}
              onSelect={handleSelectClient}
              onClear={handleClearClient}
              label={GLOBAL_UI_MESSAGES.common.client}
            />
            <Input
              label={SEARCH_MESSAGES.filters.idNumber}
              type="text"
              value={filters.id_number}
              onChange={(e) => onFilterChange('id_number', e.target.value)}
              placeholder={SEARCH_MESSAGES.filters.idNumberPlaceholder}
            />
            <Input
              label={SEARCH_MESSAGES.filters.binderNumber}
              type="text"
              value={filters.binder_number}
              onChange={(e) => onFilterChange('binder_number', e.target.value)}
              placeholder={SEARCH_MESSAGES.filters.binderNumberPlaceholder}
            />
            <Select
              label={SEARCH_MESSAGES.filters.clientStatus}
              value={filters.client_status}
              onChange={(e) => onFilterChange('client_status', e.target.value)}
              options={withEmptyOption(SEARCH_MESSAGES.filters.allStatuses, CLIENT_STATUS_OPTIONS)}
            />
            <Select
              label={SEARCH_MESSAGES.filters.entityType}
              value={filters.entity_type}
              onChange={(e) => onFilterChange('entity_type', e.target.value)}
              options={withEmptyOption(SEARCH_MESSAGES.filters.allTypes, ENTITY_TYPE_OPTIONS)}
            />
            <Select
              label={SEARCH_MESSAGES.filters.binderLocation}
              value={filters.binder_location_status}
              onChange={(e) => onFilterChange('binder_location_status', e.target.value)}
              options={withEmptyOption(SEARCH_MESSAGES.filters.allStatuses, BINDER_LOCATION_STATUS_OPTIONS)}
            />
            <Select
              label={SEARCH_MESSAGES.filters.binderCapacity}
              value={filters.binder_capacity_status}
              onChange={(e) => onFilterChange('binder_capacity_status', e.target.value)}
              options={BINDER_CAPACITY_STATUS_OPTIONS}
            />
            <Input
              label={SEARCH_MESSAGES.filters.filename}
              type="text"
              value={filters.filename}
              onChange={(e) => onFilterChange('filename', e.target.value)}
              placeholder={DOCUMENT_FILENAME_SEARCH_PLACEHOLDER}
            />
          </div>

          {advancedCount > 0 && onReset && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-2">
              <span className="text-xs text-gray-500">{SEARCH_MESSAGES.filters.activeFilters(advancedCount)}</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                icon={<RotateCcw className="h-3.5 w-3.5" />}
                onClick={onReset}
              >
                {SEARCH_MESSAGES.filters.resetAll}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
