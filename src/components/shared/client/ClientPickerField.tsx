import { ClientSearchInput, SelectedClientDisplay } from './ClientSearchInput'

interface ClientPickerSelectedClient {
  id: number
  name: string
  office_client_number?: number | null
}

export interface ClientPickerSearchResult {
  id: number
  name: string
  id_number: string
  client_status?: string | null
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
  placeholder = 'חפש לפי שם, ת"ז / ח.פ...',
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
