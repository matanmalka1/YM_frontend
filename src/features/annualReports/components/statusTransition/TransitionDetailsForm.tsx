import { getStatusLabel } from '../../constants/display'
import { Button } from '../../../../components/ui/primitives/Button'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import type { TransitionDetailsFormProps } from '../../types'
import { SUBMISSION_METHOD_OPTIONS } from '../../constants/submissionMethodOptions'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
        label={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.noteLabel}
        value={form.note}
        onChange={onFieldChange('note')}
        placeholder={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.notePlaceholder}
      />

      {selected === 'submitted' && (
        <>
          <Input
            label={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.itaRefLabel}
            value={form.itaRef}
            onChange={onFieldChange('itaRef')}
            placeholder={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.itaRefPlaceholder}
          />
          <Select
            label={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.submissionMethodLabel}
            value={form.submissionMethod}
            onChange={onFieldChange('submissionMethod')}
            options={SUBMISSION_METHOD_OPTIONS}
          />
        </>
      )}

      {selected === 'closed' && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            label={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.assessmentAmountLabel}
            type="number"
            value={form.assessmentAmount}
            onChange={onFieldChange('assessmentAmount')}
          />
          <Input
            label={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.refundDueLabel}
            type="number"
            value={form.refundDue}
            onChange={onFieldChange('refundDue')}
          />
          <Input
            label={ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.taxDueLabel}
            type="number"
            value={form.taxDue}
            onChange={onFieldChange('taxDue')}
          />
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {GLOBAL_UI_MESSAGES.actions.cancel}
        </Button>
        <Button type="button" variant="primary" size="sm" onClick={onSubmit} isLoading={isLoading}>
          {ANNUAL_REPORTS_MESSAGES.transitionDetailsForm.confirmTransitionTo(getStatusLabel(selected))}
        </Button>
      </div>
    </div>
  )
}
