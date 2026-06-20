import { useRef } from 'react'
import { Download, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'
import { Modal } from '../../../components/ui/overlays/Modal'
import { Button } from '../../../components/ui/primitives/Button'
import { Card } from '../../../components/ui/primitives/Card'
import { useImportExport } from '../hooks/useImportExport'

// ── Export panel ───────────────────────────────────────────────────────────────

interface ExportPanelProps {
  exporting: boolean
  onExport: () => void
}
const ExportPanel: React.FC<ExportPanelProps> = ({ exporting, onExport }) => (
  <Card title="ייצוא לקוחות" variant="elevated">
    <div className="space-y-4">
      <p className="text-sm text-gray-600">הורדת כל נתוני הלקוחות לקובץ Excel מסודר.</p>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
        הקובץ כולל שדות לקוח, פרטי עסק, סטטוס ונתוני מס רלוונטיים.
      </div>

      <Button variant="primary" onClick={onExport} isLoading={exporting} className="gap-2">
        <Download className="h-4 w-4" />
        ייצוא ל־Excel
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
    <Card title="ייבוא לקוחות" variant="elevated">
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="space-y-1 text-sm text-amber-900">
              <p className="font-medium">ייבוא יוצר לקוחות חדשים במערכת.</p>
              <p>מומלץ להוריד תבנית, למלא אותה, ואז להעלות את הקובץ.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div>
            <p className="text-sm font-medium text-gray-900">תבנית ייבוא</p>
            <p className="text-xs text-gray-500">כוללת את שמות העמודות הנדרשים</p>
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onDownloadTemplate}>
            הורד תבנית
          </Button>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-primary-400">
          <input
            ref={fileInputRef}
            type="file"
            aria-label="ייבוא קובץ"
            accept=".xlsx,.xls"
            onChange={handleChange}
            className="hidden"
            disabled={importing}
          />

          <FileSpreadsheet className="mx-auto mb-3 h-10 w-10 text-gray-400" />

          <p className="mb-3 text-sm text-gray-600">העלה קובץ Excel בפורמט התבנית</p>

          <Button
            type="button"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            isLoading={importing}
            disabled={importing}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'מייבא...' : 'בחר קובץ'}
          </Button>
        </div>

        <p className="text-xs text-gray-500">פורמטים נתמכים: xlsx, xls. תאריכים בפורמט YYYY-MM-DD.</p>
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
      title="ייבוא וייצוא לקוחות"
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            סגור
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
