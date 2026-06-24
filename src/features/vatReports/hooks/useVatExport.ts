import { useState } from 'react'
import { vatReportsApi } from '../api'
import { showErrorToast } from '@/utils/utils'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

export const useVatExport = (clientId: number, year: number) => {
  const [loadingType, setLoadingType] = useState<'excel' | 'pdf' | null>(null)

  const exportVat = async (format: 'excel' | 'pdf') => {
    setLoadingType(format)
    try {
      await vatReportsApi.exportClientVat(clientId, format, year)
    } catch (err) {
      showErrorToast(err, VAT_ERROR_MESSAGES.mutations.exportError)
    } finally {
      setLoadingType(null)
    }
  }

  return { exportVat, loadingType }
}
