import { getStatusLabel } from '../../api'
import { Button } from '../../../../components/ui/primitives/Button'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import type { TransitionDetailsFormProps } from '../../types'
import { SUBMISSION_METHOD_OPTIONS } from '../shared/submissionMethodOptions'

export const TransitionDetailsForm = ({
  selected,
  form,
  isLoading,
  onFieldChange,
  onCancel,
  onSubmit,
}: TransitionDetailsFormProps) => {
  return (
    <div className="animate-fade-in space-y-3 rounded-lg border border-primary-100 bg-primary-50/30 p-4">
      <Input
        label="הערה (אופציונלי)"
        value={form.note}
        onChange={onFieldChange('note')}
        placeholder="הערה על המעבר..."
      />

      {selected === 'submitted' && (
        <>
          <Input
            label="מספר אסמכתא (ITA)"
            value={form.itaRef}
            onChange={onFieldChange('itaRef')}
            placeholder="מספר אסמכתא ממס הכנסה"
          />
          <Select
            label="שיטת הגשה"
            value={form.submissionMethod}
            onChange={onFieldChange('submissionMethod')}
            options={SUBMISSION_METHOD_OPTIONS}
          />
        </>
      )}

      {selected === 'closed' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label="סכום שומה (₪)"
            type="number"
            value={form.assessmentAmount}
            onChange={onFieldChange('assessmentAmount')}
          />
          <Input label="החזר מס (₪)" type="number" value={form.refundDue} onChange={onFieldChange('refundDue')} />
          <Input label="תשלום נוסף (₪)" type="number" value={form.taxDue} onChange={onFieldChange('taxDue')} />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          ביטול
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={onSubmit} isLoading={isLoading}>
          אישור מעבר ל{getStatusLabel(selected)}
        </Button>
      </div>
    </div>
  )
}
