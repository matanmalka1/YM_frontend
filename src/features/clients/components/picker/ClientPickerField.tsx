import { ClientSearchInput, SelectedClientDisplay } from './ClientSearchInput'
import { CLIENT_SEARCH_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'
import type { ClientStatus } from '@/features/clients/api'

interface ClientPickerSelectedClient {
  id: number
  name: string
  office_client_number?: number | null
  client_status?: ClientStatus | null
}

interface ClientPickerSearchResult {
  id: number
  name: string
  id_number: string
  client_status?: ClientStatus | null
  office_client_number?: number | null
}

interface ClientPickerFieldProps {
  selectedClient: ClientPickerSelectedClient | null
  clientQuery: string
  onQueryChange: (query: string) => void
  onSelect: (client: ClientPickerSearchResult) => void
  onClear: () => void
  error?: string
  label?: string
  placeholder?: string
}

export const ClientPickerField = ({
  selectedClient,
  clientQuery,
  onQueryChange,
  onSelect,
  onClear,
  error,
  label = 'לקוח',
  placeholder = CLIENT_SEARCH_PLACEHOLDER,
}: ClientPickerFieldProps) => {
  if (selectedClient) {
    return (
      <SelectedClientDisplay
        name={selectedClient.name}
        officeClientNumber={selectedClient.office_client_number}
        onClear={onClear}
        label={label}
      />
    )
  }

  return (
    <ClientSearchInput
      label={label}
      placeholder={placeholder}
      value={clientQuery}
      onChange={onQueryChange}
      onSelect={onSelect}
      error={error}
    />
  )
}
