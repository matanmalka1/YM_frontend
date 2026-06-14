import { Controller, type UseFormReturn } from 'react-hook-form'
import { Select } from '@/components/ui/inputs/Select'
import {
  BIMONTHLY_START_MONTH_VALUES,
  MONTH_OPTIONS,
  getOperationalYearOptions,
} from '@/constants/periodOptions.constants'
import type { ReceiveBinderFormValues } from '../../schemas'
import { PERIODIC_BINDER_TYPES, type BinderTypeValue } from '../../constants'

interface BinderPeriodFieldsProps {
  form: UseFormReturn<ReceiveBinderFormValues>
  materialType?: BinderTypeValue
  vatType: 'monthly' | 'bimonthly' | 'exempt' | null
}

export const BinderPeriodFields: React.FC<BinderPeriodFieldsProps> = ({ form, materialType, vatType }) => {
  const {
    control,
    formState: { errors },
  } = form

  const periodicMode = materialType ? PERIODIC_BINDER_TYPES.has(materialType) : false
  const bimonthlyVatMode = materialType === 'vat' && vatType === 'bimonthly'
  const monthOptions = bimonthlyVatMode
    ? MONTH_OPTIONS.filter((option) => BIMONTHLY_START_MONTH_VALUES.has(option.value))
    : MONTH_OPTIONS

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Controller
        name="period_year"
        control={control}
        render={({ field }) => (
          <Select
            label="שנת דיווח"
            error={errors.period_year?.message}
            options={[{ value: '', label: 'בחר שנה...', disabled: true }, ...getOperationalYearOptions()]}
            value={field.value ? String(field.value) : ''}
            onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
            onBlur={field.onBlur}
            name={field.name}
          />
        )}
      />

      {periodicMode && (
        <Controller
          name="period_month_start"
          control={control}
          render={({ field }) => (
            <Select
              label={bimonthlyVatMode ? 'חודש התחלה' : 'חודש דיווח'}
              error={errors.period_month_start?.message}
              options={[{ value: '', label: 'בחר חודש...', disabled: true }, ...monthOptions]}
              value={field.value ? String(field.value) : ''}
              onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
      )}

      {bimonthlyVatMode && (
        <Controller
          name="period_month_end"
          control={control}
          render={({ field }) => (
            <Select
              label="חודש סיום"
              error={errors.period_month_end?.message}
              options={[{ value: '', label: 'ייבחר אוטומטית', disabled: true }, ...MONTH_OPTIONS]}
              value={field.value ? String(field.value) : ''}
              onChange={() => undefined}
              onBlur={field.onBlur}
              name={field.name}
              disabled
            />
          )}
        />
      )}
    </div>
  )
}

BinderPeriodFields.displayName = 'BinderPeriodFields'
