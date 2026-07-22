import { useCallback, useState } from 'react'
import type { ClientStatus } from '@/features/clients/api'

export interface ClientPickerValue {
  id: number
  name: string
  office_client_number?: number | null
  client_status?: ClientStatus | null
}

interface ClientPickerSetterOptions {
  shouldDirty: boolean
  shouldValidate: boolean
}

interface UseClientPickerStateOptions {
  onSelect?: (client: ClientPickerValue) => void
  onClear?: () => void
}

const clientPickerFieldOptions = {
  shouldDirty: true,
  shouldValidate: true,
} as const satisfies ClientPickerSetterOptions

export const createClientIdPickerHandlers = (
  setClientId: (value: string, options: ClientPickerSetterOptions) => void,
): UseClientPickerStateOptions => ({
  onSelect: (client) => setClientId(String(client.id), clientPickerFieldOptions),
  onClear: () => setClientId('', clientPickerFieldOptions),
})

export const useClientPickerState = ({ onSelect, onClear }: UseClientPickerStateOptions = {}) => {
  const [clientQuery, setClientQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<ClientPickerValue | null>(null)

  const handleSelectClient = useCallback(
    (client: ClientPickerValue) => {
      setSelectedClient(client)
      setClientQuery(client.name)
      onSelect?.(client)
    },
    [onSelect],
  )

  const handleClearClient = useCallback(() => {
    setSelectedClient(null)
    setClientQuery('')
    onClear?.()
  }, [onClear])

  const handleClientQueryChange = useCallback(
    (query: string) => {
      setClientQuery(query)
      if (!selectedClient) return
      setSelectedClient(null)
      onClear?.()
    },
    [onClear, selectedClient],
  )

  const resetClientPicker = useCallback(() => {
    setClientQuery('')
    setSelectedClient(null)
  }, [])

  return {
    clientQuery,
    selectedClient,
    handleSelectClient,
    handleClearClient,
    handleClientQueryChange,
    resetClientPicker,
  }
}
