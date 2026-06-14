import { useEffect, useState } from 'react'
import { ClientSearchInput, SelectedClientDisplay } from '@/components/shared/client'
import type { ClientPickerFieldDef } from './types'

interface Props {
  field: ClientPickerFieldDef
  values: Record<string, string>
  onMultiChange: (updates: Record<string, string>) => void
}

export const ClientPickerFilter: React.FC<Props> = ({ field, values, onMultiChange }) => {
  const idVal = values[field.idKey]
  const nameVal = field.nameKey ? values[field.nameKey] : undefined
  const [clientQuery, setClientQuery] = useState(nameVal ?? '')
  const selectedClient = idVal ? { id: Number(idVal), name: nameVal ?? `#${idVal}` } : null

  useEffect(() => {
    if (!idVal) setClientQuery('')
  }, [idVal])

  return (
    <div>
      {selectedClient ? (
        <SelectedClientDisplay
          name={selectedClient.name}
          label={field.label}
          onClear={() => {
            const updates: Record<string, string> = { [field.idKey]: '' }
            if (field.nameKey) updates[field.nameKey] = ''
            onMultiChange(updates)
          }}
        />
      ) : (
        <ClientSearchInput
          label={field.label}
          value={clientQuery}
          onChange={setClientQuery}
          placeholder={field.placeholder}
          onSelect={(client) => {
            setClientQuery(client.name)
            const updates: Record<string, string> = { [field.idKey]: String(client.id) }
            if (field.nameKey) updates[field.nameKey] = client.name
            onMultiChange(updates)
          }}
        />
      )}
    </div>
  )
}
