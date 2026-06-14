import { Check, Plus, X } from 'lucide-react'
import type { AnnualReportScheduleKey } from '../../api'
import { Button } from '../../../../components/ui/primitives/Button'
import { Input } from '../../../../components/ui/inputs/Input'
import { AnnexDataTable } from './AnnexDataTable'
import { ANNEX_TEXT, FIELD_INPUT_CLASS, TABLE_ICON_CLASS } from './annex.constants'
import { getInputType } from './annex.helpers'
import { useAnnexDataPanel } from '../../hooks/useAnnexDataPanel'

interface Props {
  reportId: number
  schedule: AnnualReportScheduleKey
  scheduleLabel: string
}

export const AnnexDataPanel: React.FC<Props> = ({ reportId, schedule, scheduleLabel }) => {
  const panel = useAnnexDataPanel(reportId, schedule)

  if (panel.isLoading) return <p className="text-xs text-gray-400 py-2">{ANNEX_TEXT.loading}</p>

  return (
    <div className="mt-3 space-y-2">
      {panel.lines.length > 0 ? (
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
      ) : null}

      {panel.showForm ? (
        <form onSubmit={panel.submitAdd} className="border border-gray-200 rounded-lg p-3 space-y-2 bg-gray-50">
          <p className="text-xs font-medium text-gray-600">
            {ANNEX_TEXT.addLine} - {scheduleLabel}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {panel.fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-gray-500 block mb-0.5">{f.label}</label>
                <Input
                  type={getInputType(f.type)}
                  step={f.type === 'number' ? 'any' : undefined}
                  className={FIELD_INPUT_CLASS}
                  error={panel.errors[f.key]?.message as string | undefined}
                  {...panel.register(f.key)}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={panel.cancelAdd}>
              <X className={TABLE_ICON_CLASS} />
            </Button>
            <Button type="submit" size="sm" isLoading={panel.isAdding}>
              <Check className={`${TABLE_ICON_CLASS} ml-1`} />
              {ANNEX_TEXT.save}
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={panel.openAddForm}>
          <Plus className={`${TABLE_ICON_CLASS} ml-1`} />
          {ANNEX_TEXT.addLine}
        </Button>
      )}
    </div>
  )
}

AnnexDataPanel.displayName = 'AnnexDataPanel'
