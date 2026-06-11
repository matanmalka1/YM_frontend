import { useState } from 'react'
import { Pencil, X, Check, Info } from 'lucide-react'
import { Input } from '../../../../components/ui/inputs/Input'
import { Button } from '../../../../components/ui/primitives/Button'

interface TaxCalculatorInputsProps {
  pension: string
  otherCredits: string
  onPensionChange: (v: string) => void
  onOtherCreditsChange: (v: string) => void
  onSave: () => void
  onEditInit: () => void
  isSaving: boolean
}

export const TaxCalculatorInputs = ({
  pension,
  otherCredits,
  onPensionChange,
  onOtherCreditsChange,
  onSave,
  onEditInit,
  isSaving,
}: TaxCalculatorInputsProps) => {
  const [editMode, setEditMode] = useState(false)

  const handleEdit = () => {
    onEditInit()
    setEditMode(true)
  }
  const handleSave = () => {
    onSave()
    setEditMode(false)
  }
  const handleCancel = () => setEditMode(false)

  return (
    <div className="rounded-xl border border-info-200 bg-info-50 p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-info-600 shrink-0 mt-px" />
          <p className="text-xs text-info-700">המחשבון מציג שיעורי מס עפ"י מדרגות מס לעסק יחיד/שותפות.</p>
        </div>
        {!editMode ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="border-info-300 text-info-700 hover:bg-info-50 shrink-0 text-xs px-2.5 py-1"
          >
            <Pencil className="h-3 w-3" /> עריכה
          </Button>
        ) : (
          <div className="flex gap-1 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-info-600 hover:bg-info-700 text-xs px-2.5 py-1"
            >
              <Check className="h-3 w-3" /> שמור
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="border-info-300 text-info-700 text-xs px-2.5 py-1"
            >
              <X className="h-3 w-3" /> ביטול
            </Button>
          </div>
        )}
      </div>
      {editMode && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={'הפקדות פנסיה/קה"ש (₪)'}
            type="number"
            value={pension}
            onChange={(e) => onPensionChange(e.target.value)}
          />
          <Input
            label="זיכויים אחרים (₪)"
            type="number"
            value={otherCredits}
            onChange={(e) => onOtherCreditsChange(e.target.value)}
            className="col-span-2"
          />
        </div>
      )}
    </div>
  )
}

TaxCalculatorInputs.displayName = 'TaxCalculatorInputs'
