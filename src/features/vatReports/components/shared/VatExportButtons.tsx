import { FileSpreadsheet, FileText } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { useVatExport } from '../../hooks/useVatExport'
import type { VatExportButtonsProps } from '../../types'
import { FILE_FORMAT_COLORS } from '../../visualizationTokens'

export const VatExportButtons: React.FC<VatExportButtonsProps> = ({ clientId, period, year }) => {
  const exportYear = year ?? Number(period?.split('-')[0] ?? new Date().getFullYear())
  const { exportVat, loadingType } = useVatExport(clientId, exportYear)

  return (
    <div
      className="inline-flex items-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 shadow-sm"
      dir="rtl"
    >
      <Button
        variant="secondary"
        size="sm"
        className="rounded-none border-l border-gray-200 bg-gray-50 shadow-none"
        isLoading={loadingType === 'excel'}
        onClick={() => exportVat('excel')}
      >
        <FileSpreadsheet className={`h-4 w-4 ${FILE_FORMAT_COLORS.excel}`} />
        Excel
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="rounded-none bg-gray-50 shadow-none"
        isLoading={loadingType === 'pdf'}
        onClick={() => exportVat('pdf')}
      >
        <FileText className={`h-4 w-4 ${FILE_FORMAT_COLORS.pdf}`} />
        PDF
      </Button>
    </div>
  )
}

VatExportButtons.displayName = 'VatExportButtons'
