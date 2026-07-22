import { useMemo } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { Input, Select } from '@/components/ui/inputs'
import { MONTHS_COVERED_OPTIONS } from '@/constants/periodOptions.constants'
import { CHARGE_TYPE_OPTIONS } from '../../constants'
import type { ChargeCoreFormValues } from '../../schemas'
import { buildChargePeriodOptions } from '../../utils/chargeHelpers'
import { CHARGES_MESSAGES } from '../../messages'

interface ChargeCoreFieldsProps {
  businessOptions: Array<{ value: string; label: string }>
  showBusinessSelect: boolean
  singleBusinessLabel?: string
}

export const ChargeCoreFields = ({ businessOptions, showBusinessSelect, singleBusinessLabel }: ChargeCoreFieldsProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ChargeCoreFormValues>()
  const monthsCovered = useWatch({ control, name: 'months_covered' }) ?? 1
  const periodOptions = useMemo(() => buildChargePeriodOptions(monthsCovered), [monthsCovered])

  return (
    <>
      {showBusinessSelect ? (
        <div className="col-span-2">
          <Controller
            control={control}
            name="business_id"
            render={({ field }) => (
              <Select
                label={CHARGES_MESSAGES.create.business}
                value={field.value != null ? String(field.value) : ''}
                onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                onBlur={field.onBlur}
                name={field.name}
                options={businessOptions}
              />
            )}
          />
        </div>
      ) : singleBusinessLabel ? (
        <div className="col-span-2">
          <Input label={CHARGES_MESSAGES.create.business} value={singleBusinessLabel} readOnly disabled />
        </div>
      ) : null}

      <Input
        label={CHARGES_MESSAGES.create.amount}
        type="number"
        min={0.01}
        step="0.01"
        placeholder="0.00"
        error={errors.amount?.message}
        endElement={<span className="text-sm text-gray-400">₪</span>}
        {...register('amount')}
      />
      <Controller
        control={control}
        name="charge_type"
        render={({ field }) => (
          <Select
            label={CHARGES_MESSAGES.create.type}
            error={errors.charge_type?.message}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            options={CHARGE_TYPE_OPTIONS}
          />
        )}
      />
      <Controller
        control={control}
        name="months_covered"
        render={({ field }) => (
          <Select
            label={CHARGES_MESSAGES.create.monthsCovered}
            error={errors.months_covered?.message}
            value={String(field.value ?? 1)}
            onChange={(event) => field.onChange(Number(event.target.value) as 1 | 2)}
            onBlur={field.onBlur}
            name={field.name}
            options={MONTHS_COVERED_OPTIONS}
          />
        )}
      />
      <Controller
        control={control}
        name="period"
        render={({ field }) => (
          <Select
            label={CHARGES_MESSAGES.create.period}
            error={errors.period?.message}
            value={field.value ?? ''}
            onChange={(event) => field.onChange(event.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            options={periodOptions}
          />
        )}
      />
    </>
  )
}
