import { ClientStatusCard } from '@/features/clients'

interface SearchClientSummaryProps {
  clientId: number | null
}

export const SearchClientSummary: React.FC<SearchClientSummaryProps> = ({ clientId }) => {
  if (clientId === null) return null
  return <ClientStatusCard clientId={clientId} />
}

SearchClientSummary.displayName = 'SearchClientSummary'
