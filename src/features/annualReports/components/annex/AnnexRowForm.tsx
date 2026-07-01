import type { FormEventHandler } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { Check } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import type { FieldDef } from '../../constants/annexConstants'
import type { AnnexFormValues } from '../../constants/annexSchema'
import { ANNEX_TEXT, TABLE_ICON_CLASS } from '../../constants/annexTextConstants'
import { AnnexFieldInput } from './AnnexFieldInput'

interface AnnexRowFormProps {
  scheduleLabel: string
  fields: FieldDef[]
  register: UseFormRegister<AnnexFormValues>
  errors: FieldErrors<AnnexFormValues>
  isSaving: boolean
  onSubmit: FormEventHandler<HTMLFormElement>
  onCancel: () => void
}

export const AnnexRowForm: React.FC<AnnexRowFormProps> = ({
  scheduleLabel,
  fields,
  register,
  errors,
  isSaving,
  onSubmit,
  onCancel,
}) => (
  <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50/70 p-3">
    <p className="text-xs font-semibold text-gray-700">
      {ANNEX_TEXT.addLine} · {scheduleLabel}
    </p>
    <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3">
      {fields.map((field) => (
        <AnnexFieldInput key={field.key} field={field} label={field.label} register={register} errors={errors} />
      ))}
    </div>
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        {ANNEX_TEXT.cancel}
      </Button>
      <Button type="submit" size="sm" isLoading={isSaving} icon={<Check className={TABLE_ICON_CLASS} />}>
        {ANNEX_TEXT.save}
      </Button>
    </div>
  </form>
)

AnnexRowForm.displayName = 'AnnexRowForm'
