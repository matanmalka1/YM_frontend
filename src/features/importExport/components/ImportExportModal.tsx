import { useRef } from 'react'
import { Download, Upload, FileSpreadsheet } from 'lucide-react'
import { Alert } from '../../../components/ui/overlays/Alert'
import { Modal } from '../../../components/ui/overlays/Modal'
import { HiddenFileInput } from '../../../components/ui/inputs/HiddenFileInput'
import { Button } from '../../../components/ui/primitives/Button'
import { Card } from '../../../components/ui/primitives/Card'
import { useImportExport } from '../hooks/useImportExport'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { IMPORT_EXPORT_MESSAGES } from '../messages'

// ── Export panel ───────────────────────────────────────────────────────────────

interface ExportPanelProps {
  exporting: boolean
  onExport: () => void
}
const ExportPanel: React.FC<ExportPanelProps> = ({ exporting, onExport }) => (
  <Card title={IMPORT_EXPORT_MESSAGES.exportPanel.title} variant="elevated">
    <div className="space-y-4">
      <p className="text-sm text-gray-600">{IMPORT_EXPORT_MESSAGES.exportPanel.description}</p>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
        {IMPORT_EXPORT_MESSAGES.exportPanel.details}
      </div>

      <Button variant="primary" icon={<Download className="h-4 w-4" />} onClick={onExport} isLoading={exporting}>
        {IMPORT_EXPORT_MESSAGES.exportPanel.action}
      </Button>
    </div>
  </Card>
)

// ── Import panel ───────────────────────────────────────────────────────────────

interface ImportPanelProps {
  importing: boolean
  onFileSelect: (file: File) => void
  onDownloadTemplate: () => void
}
const ImportPanel: React.FC<ImportPanelProps> = ({ importing, onFileSelect, onDownloadTemplate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    onFileSelect(file)

    e.target.value = ''
  }

  return (
    <Card title={IMPORT_EXPORT_MESSAGES.importPanel.title} variant="elevated">
      <div className="space-y-4">
        <Alert variant="warning" size="sm" message={IMPORT_EXPORT_MESSAGES.importPanel.warning} />

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div>
            <p className="text-sm font-medium text-gray-900">{IMPORT_EXPORT_MESSAGES.importPanel.templateTitle}</p>
            <p className="text-xs text-gray-500">{IMPORT_EXPORT_MESSAGES.importPanel.templateDescription}</p>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onDownloadTemplate}>
            {IMPORT_EXPORT_MESSAGES.importPanel.downloadTemplate}
          </Button>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-primary-400">
          <HiddenFileInput
            ref={fileInputRef}
            aria-label={IMPORT_EXPORT_MESSAGES.importPanel.fileInputAriaLabel}
            accept=".xlsx,.xls"
            onChange={handleChange}
            disabled={importing}
          />

          <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-gray-400" />

          <p className="mb-3 text-sm text-gray-600">{IMPORT_EXPORT_MESSAGES.importPanel.uploadPrompt}</p>

          <Button
            type="button"
            variant="primary"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
            isLoading={importing}
            disabled={importing}
          >
            {importing ? IMPORT_EXPORT_MESSAGES.importPanel.importing : IMPORT_EXPORT_MESSAGES.importPanel.chooseFile}
          </Button>
        </div>

        <p className="text-xs text-gray-500">{IMPORT_EXPORT_MESSAGES.importPanel.supportedFormats}</p>
      </div>
    </Card>
  )
}

interface ImportExportModalProps {
  open: boolean
  onClose: () => void
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ open, onClose }) => {
  const { importing, exporting, handleExport, handleImport, handleDownloadTemplate } = useImportExport()

  return (
    <Modal
      open={open}
      title={IMPORT_EXPORT_MESSAGES.modal.title}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {GLOBAL_UI_MESSAGES.actions.close}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ExportPanel exporting={exporting} onExport={handleExport} />
        <ImportPanel importing={importing} onFileSelect={handleImport} onDownloadTemplate={handleDownloadTemplate} />
      </div>
    </Modal>
  )
}
