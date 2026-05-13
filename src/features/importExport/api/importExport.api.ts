import { api } from '../../../api/client'
import { CLIENT_ENDPOINTS } from '@/features/clients'
import { randomUUID } from '@/utils/random'

interface ImportClientsResponse {
  created: number
  total_rows: number
  errors: Array<{
    row: number
    error: string
  }>
}

export const importExportApi = {
  exportClients: () =>
    api.get<Blob>(CLIENT_ENDPOINTS.clientsExport, {
      responseType: 'blob',
    }),

  importClients: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post<ImportClientsResponse>(CLIENT_ENDPOINTS.clientsImport, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Idempotency-Key': randomUUID(),
      },
    })
  },

  downloadTemplate: () =>
    api.get<Blob>(CLIENT_ENDPOINTS.clientsTemplate, {
      responseType: 'blob',
    }),
}
