import { useState } from 'react'
import type { AnnualReportScheduleKey, ScheduleEntry } from '../../api'
import { Button } from '../../../../components/ui/primitives/Button'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { ANNEX_TEXT } from '../../constants/annexTextConstants'
import { buildScheduleOptions, getAvailableSchedules, normalizeNotes } from '../../utils/annexHelpers'

interface ScheduleAddFormProps {
  schedules: ScheduleEntry[]
  onAdd: (schedule: AnnualReportScheduleKey, notes?: string) => void
  isAdding: boolean
}

export const ScheduleAddForm: React.FC<ScheduleAddFormProps> = ({ schedules, onAdd, isAdding }) => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<AnnualReportScheduleKey | ''>('')
  const [notes, setNotes] = useState('')

  const available = getAvailableSchedules(schedules)

  const resetFields = () => {
    setSelected('')
    setNotes('')
  }

  const handleOpen = () => {
    resetFields()
    setOpen(true)
  }

  const handleCancel = () => {
    resetFields()
    setOpen(false)
  }

  const handleAdd = () => {
    if (!selected) return
    onAdd(selected, normalizeNotes(notes))
    handleCancel()
  }

  if (available.length === 0) {
    return <p className="text-xs text-gray-500">{ANNEX_TEXT.allSchedulesExist}</p>
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={handleOpen}>
        {ANNEX_TEXT.addAnnex}
      </Button>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
      <p className="text-xs font-medium text-gray-600">{ANNEX_TEXT.addAnnexManual}</p>
      <Select
        value={selected}
        onChange={(event) => setSelected(event.target.value as AnnualReportScheduleKey | '')}
        options={buildScheduleOptions(available, ANNEX_TEXT.chooseSchedule)}
      />
      <Input
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        type="text"
        placeholder={ANNEX_TEXT.notesPlaceholder}
      />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
          {ANNEX_TEXT.cancel}
        </Button>
        <Button type="button" size="sm" onClick={handleAdd} isLoading={isAdding} disabled={!selected}>
          {ANNEX_TEXT.addAnnex}
        </Button>
      </div>
    </div>
  )
}

ScheduleAddForm.displayName = 'ScheduleAddForm'
