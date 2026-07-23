import { useEffect, useState } from 'react'
import { useSearchDebounce } from '@/hooks/useSearchDebounce'
import { ClientSearchInput } from './ClientSearchInput'

export interface ClientPickerFilterConfig {
  idKey: string
  nameKey?: string
  /**
   * Hybrid free-search mode: while typing, the raw query commits (debounced)
   * to this URL key and filters the list; picking a suggestion switches to
   * exact `idKey` filtering and clears it. One input, two filter modes.
   */
  searchKey?: string
  label?: string
  placeholder?: string
}

interface ClientPickerFilterProps {
  field: ClientPickerFilterConfig
  values: Readonly<Record<string, string | undefined>>
  onMultiChange: (updates: Record<string, string>) => void
  size?: 'sm' | 'md'
  /** Inline placement (toolbar row): no visible label. */
  hideLabel?: boolean
}

/** Adapts URL filter values (id/name/search string params) to the controlled ClientSearchInput. */
export const ClientPickerFilter: React.FC<ClientPickerFilterProps> = ({
  field,
  values,
  onMultiChange,
  size = 'md',
  hideLabel,
}) => {
  const idVal = values[field.idKey]
  const nameVal = field.nameKey ? values[field.nameKey] : undefined
  const searchVal = field.searchKey ? (values[field.searchKey] ?? '') : ''
  const selectedClient = idVal ? { name: nameVal ?? `#${idVal}` } : null

  // Free-search draft, committed debounced to the URL. Guarded by the current
  // selection: a commit racing a just-made selection must not resurrect the
  // free-text param next to the exact id.
  const [searchDraft, setSearchDraft] = useSearchDebounce(searchVal, (value) => {
    if (!field.searchKey || idVal) return
    onMultiChange({ [field.searchKey]: value.trim() })
  })
  const [clientQuery, setClientQuery] = useState(nameVal ?? '')

  useEffect(() => {
    if (!idVal) setClientQuery('')
  }, [idVal])

  const clearedUpdates = (): Record<string, string> => {
    const updates: Record<string, string> = { [field.idKey]: '' }
    if (field.nameKey) updates[field.nameKey] = ''
    if (field.searchKey) updates[field.searchKey] = ''
    return updates
  }

  return (
    <ClientSearchInput
      value={field.searchKey ? searchDraft : clientQuery}
      onChange={field.searchKey ? setSearchDraft : setClientQuery}
      selectedClient={selectedClient}
      label={field.label}
      placeholder={field.placeholder}
      size={size}
      hideLabel={hideLabel}
      autoHighlight={!field.searchKey}
      onSelect={(client) => {
        setClientQuery(client.name)
        setSearchDraft('')
        const updates: Record<string, string> = { ...clearedUpdates(), [field.idKey]: String(client.id) }
        if (field.nameKey) updates[field.nameKey] = client.name
        onMultiChange(updates)
      }}
      onClear={() => {
        setSearchDraft('')
        onMultiChange(clearedUpdates())
      }}
    />
  )
}
