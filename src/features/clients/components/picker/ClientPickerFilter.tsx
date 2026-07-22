import { useEffect, useState } from 'react'
import { ClientSearchInput } from './ClientSearchInput'

export interface ClientPickerFilterConfig {
  idKey: string
  nameKey?: string
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

/** Adapts URL filter values (id/name string params) to the controlled ClientSearchInput. */
export const ClientPickerFilter: React.FC<ClientPickerFilterProps> = ({
  field,
  values,
  onMultiChange,
  size = 'md',
  hideLabel,
}) => {
  const idVal = values[field.idKey]
  const nameVal = field.nameKey ? values[field.nameKey] : undefined
  const [clientQuery, setClientQuery] = useState(nameVal ?? '')
  const selectedClient = idVal ? { name: nameVal ?? `#${idVal}` } : null

  useEffect(() => {
    if (!idVal) setClientQuery('')
  }, [idVal])

  return (
    <ClientSearchInput
      value={clientQuery}
      onChange={setClientQuery}
      selectedClient={selectedClient}
      label={field.label}
      placeholder={field.placeholder}
      size={size}
      hideLabel={hideLabel}
      onSelect={(client) => {
        setClientQuery(client.name)
        const updates: Record<string, string> = { [field.idKey]: String(client.id) }
        if (field.nameKey) updates[field.nameKey] = client.name
        onMultiChange(updates)
      }}
      onClear={() => {
        const updates: Record<string, string> = { [field.idKey]: '' }
        if (field.nameKey) updates[field.nameKey] = ''
        onMultiChange(updates)
      }}
    />
  )
}
