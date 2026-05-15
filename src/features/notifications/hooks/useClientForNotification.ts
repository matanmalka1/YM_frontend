import { useCallback, useState } from 'react'
import { clientsApi } from '@/features/clients'

interface ClientContact {
  phone: string | null
  email: string | null
}

interface ClientSelection {
  id: number
  name: string
}

export const useClientForNotification = (initialClientId?: number) => {
  const [selectedClient, setSelectedClient] = useState<ClientSelection | null>(
    initialClientId != null ? { id: initialClientId, name: '' } : null,
  )
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null)
  const [clientContact, setClientContact] = useState<ClientContact | null>(null)

  const loadClientData = useCallback(async (clientId: number) => {
    try {
      const [clientData, bizData] = await Promise.all([
        clientsApi.getById(clientId),
        clientsApi.listAllBusinessesForClient(clientId),
      ])
      setClientContact({ phone: clientData.phone, email: clientData.email })
      const active = bizData.items.find((b) => b.status === 'active') ?? bizData.items[0]
      setSelectedBusinessId(active?.id ?? null)
    } catch {
      setClientContact(null)
      setSelectedBusinessId(null)
    }
  }, [])

  const selectClient = async (client: ClientSelection) => {
    setSelectedClient(client)
    setSelectedBusinessId(null)
    await loadClientData(client.id)
  }

  const clearClient = () => {
    setSelectedClient(null)
    setSelectedBusinessId(null)
    setClientContact(null)
  }

  const reset = (clientId?: number) => {
    if (clientId != null) {
      setSelectedClient({ id: clientId, name: '' })
      setSelectedBusinessId(null)
      setClientContact(null)
      void loadClientData(clientId)
    } else {
      setSelectedClient(null)
      setSelectedBusinessId(null)
      setClientContact(null)
    }
  }

  return {
    selectedClient,
    selectedBusinessId,
    clientContact,
    selectClient,
    clearClient,
    reset,
  }
}
