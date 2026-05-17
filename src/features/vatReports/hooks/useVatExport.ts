import { useState } from 'react'
import { vatReportsApi } from '../api'
import { showErrorToast } from '@/utils/utils'

export const useVatExport = (clientId: number, year: number) => {
  const [loadingType, setLoadingType] = useState<'excel' | 'pdf' | null>(null)

  const exportVat = async (format: 'excel' | 'pdf') => {
    setLoadingType(format)
    try {
      await vatReportsApi.exportClientVat(clientId, format, year)
    } catch (err) {
      showErrorToast(err, 'ייצוא נכשל, נסה שוב')
    } finally {
      setLoadingType(null)
    }
  }

  return { exportVat, loadingType }
}
