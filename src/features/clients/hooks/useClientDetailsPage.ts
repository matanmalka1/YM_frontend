import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useClientDocumentSignals } from '@/features/documents'
import type { ActiveClientDetailsTab } from '../constants'
import { useClientMutations } from './useClientMutations'
import { useClientQuery } from './useClientQuery'

export const useClientDetailsPage = (initialTab: ActiveClientDetailsTab) => {
  const { clientId } = useParams<{ clientId: string }>()
  const clientIdNumber = clientId ? Number(clientId) : null
  const [isEditingRequested, setIsEditingRequested] = useState(false)
  const clientQuery = useClientQuery({ clientId: clientIdNumber })
  const mutations = useClientMutations(clientIdNumber ?? 0)
  const documentSignals = useClientDocumentSignals(
    clientQuery.client?.id ?? null,
    initialTab === 'details' && clientQuery.client !== null,
  )

  return {
    routeClientId: clientId,
    ...clientQuery,
    ...mutations,
    documentSignals,
    isEditing: isEditingRequested && initialTab === 'details',
    requestEdit: () => setIsEditingRequested(true),
    closeEdit: () => setIsEditingRequested(false),
  }
}
