import { useState } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { importExportApi } from '../api'
import { clientsQK } from '@/features/clients'
import { showErrorToast } from '../../../utils/utils'
import { toast } from '../../../utils/toast'
import { IMPORT_EXPORT_MESSAGES } from '../messages'
import { IMPORT_EXPORT_ERROR_MESSAGES } from '../errorMessages'

const EXCEL_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

const isExcelFile = (file: File) => {
  const name = file.name.toLowerCase()
  return name.endsWith('.xlsx') || name.endsWith('.xls')
}

const formatImportErrors = (errors: Array<{ row: number; error: string }>) =>
  errors
    .slice(0, 3)
    .map((error) => IMPORT_EXPORT_ERROR_MESSAGES.actions.importRowError(error.row, error.error))
    .join('\n')

const downloadBlob = (data: BlobPart, filename: string) => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: EXCEL_MIME })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export const useImportExport = () => {
  const queryClient = useQueryClient()

  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)

  const handleExport = async () => {
    if (exporting) return

    setExporting(true)

    try {
      const { data } = await importExportApi.exportClients()

      downloadBlob(data, `clients_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`)

      toast.success(IMPORT_EXPORT_MESSAGES.actions.exportSuccess)
    } catch (error) {
      showErrorToast(error, IMPORT_EXPORT_ERROR_MESSAGES.actions.exportError)
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    if (importing) return

    if (!isExcelFile(file)) {
      toast.error(IMPORT_EXPORT_ERROR_MESSAGES.actions.invalidFile)
      return
    }

    setImporting(true)

    try {
      const { data } = await importExportApi.importClients(file)

      if (data.created > 0) {
        await queryClient.invalidateQueries({
          queryKey: clientsQK.all,
        })
      }

      if (data.errors.length > 0) {
        const description = formatImportErrors(data.errors)
        const remainingErrors = data.errors.length - 3

        toast.warning(
          data.created > 0
            ? IMPORT_EXPORT_ERROR_MESSAGES.actions.partialSuccess(data.created)
            : IMPORT_EXPORT_MESSAGES.actions.noneCreated,
          {
            description:
              remainingErrors > 0
                ? `${description}\n${IMPORT_EXPORT_ERROR_MESSAGES.actions.moreErrors(remainingErrors)}`
                : description,
            duration: 8000,
          },
        )
        return
      }

      toast.success(IMPORT_EXPORT_MESSAGES.actions.importSuccess(data.created, data.total_rows))
    } catch (error) {
      showErrorToast(error, IMPORT_EXPORT_ERROR_MESSAGES.actions.importError)
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    if (downloadingTemplate) return

    setDownloadingTemplate(true)

    try {
      const { data } = await importExportApi.downloadTemplate()

      downloadBlob(data, 'clients_template.xlsx')

      toast.success(IMPORT_EXPORT_MESSAGES.actions.templateSuccess)
    } catch (error) {
      showErrorToast(error, IMPORT_EXPORT_ERROR_MESSAGES.actions.templateError)
    } finally {
      setDownloadingTemplate(false)
    }
  }

  return {
    importing,
    exporting,
    downloadingTemplate,
    handleExport,
    handleImport,
    handleDownloadTemplate,
  }
}
