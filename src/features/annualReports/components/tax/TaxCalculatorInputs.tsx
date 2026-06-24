import { useState } from 'react'
import { Pencil, X, Check, Info } from 'lucide-react'
import { Input } from '../../../../components/ui/inputs/Input'
import { Button } from '../../../../components/ui/primitives/Button'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

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
          <p className="text-xs text-info-700">{ANNUAL_REPORTS_MESSAGES.calculatorInputs.methodologyNote}</p>
        </div>
        {!editMode ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Pencil className="h-3 w-3" />}
            onClick={handleEdit}
            className="border-info-300 text-info-700 hover:bg-info-50 shrink-0 text-xs px-2.5 py-1"
          >
            {ANNUAL_REPORTS_MESSAGES.calculatorInputs.edit}
          </Button>
        ) : (
          <div className="flex gap-1 shrink-0">
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={<Check className="h-3 w-3" />}
              onClick={handleSave}
              disabled={isSaving}
              className="bg-info-600 hover:bg-info-700 text-xs px-2.5 py-1"
            >
              {ANNUAL_REPORTS_MESSAGES.calculatorInputs.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<X className="h-3 w-3" />}
              onClick={handleCancel}
              className="border-info-300 text-info-700 text-xs px-2.5 py-1"
            >
              {ANNUAL_REPORTS_MESSAGES.calculatorInputs.cancel}
            </Button>
          </div>
        )}
      </div>
      {editMode && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={ANNUAL_REPORTS_MESSAGES.calculatorInputs.pensionDepositsLabel}
            type="number"
            value={pension}
            onChange={(e) => onPensionChange(e.target.value)}
          />
          <Input
            label={ANNUAL_REPORTS_MESSAGES.calculatorInputs.otherCreditsLabel}
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
