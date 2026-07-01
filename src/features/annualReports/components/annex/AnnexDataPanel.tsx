import { Plus } from 'lucide-react'
import type { AnnualReportScheduleKey } from '../../api'
import { Button } from '../../../../components/ui/primitives/Button'
import { AnnexDataTable } from './AnnexDataTable'
import { AnnexEmptyState } from './AnnexEmptyState'
import { AnnexRowForm } from './AnnexRowForm'
import { ANNEX_TEXT, TABLE_ICON_CLASS } from '../../constants/annexTextConstants'
import { useAnnexDataPanel } from '../../hooks/useAnnexDataPanel'

interface Props {
  reportId: number
  schedule: AnnualReportScheduleKey
  scheduleLabel: string
}

export const AnnexDataPanel: React.FC<Props> = ({ reportId, schedule, scheduleLabel }) => {
  const panel = useAnnexDataPanel(reportId, schedule)

  if (panel.isLoading) return <p className="py-2 text-xs text-gray-400">{ANNEX_TEXT.loading}</p>

  const hasLines = panel.lines.length > 0

  return (
    <div className="space-y-3">
      {hasLines && (
        <AnnexDataTable
          lines={panel.lines}
          fields={panel.fields}
          editingLineId={panel.editingLineId}
          register={panel.register}
          errors={panel.errors}
          isUpdating={panel.isUpdating}
          isDeleting={panel.isDeleting}
          onStartEdit={panel.startEdit}
          onCancelEdit={panel.cancelEdit}
          onSaveEdit={panel.submitEdit}
          onDelete={panel.deleteLine}
        />
      )}

      {panel.showForm ? (
        <AnnexRowForm
          scheduleLabel={scheduleLabel}
          fields={panel.fields}
          register={panel.register}
          errors={panel.errors}
          isSaving={panel.isAdding}
          onSubmit={panel.submitAdd}
          onCancel={panel.cancelAdd}
        />
      ) : hasLines ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={panel.openAddForm}
            icon={<Plus className={TABLE_ICON_CLASS} />}
          >
            {ANNEX_TEXT.addLine}
          </Button>
        </div>
      ) : (
        <AnnexEmptyState onAdd={panel.openAddForm} />
      )}
    </div>
  )
}

AnnexDataPanel.displayName = 'AnnexDataPanel'
