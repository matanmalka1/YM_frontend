import { useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { ADVANCE_PAYMENT_FREQUENCY_OPTIONS, CREATE_CLIENT_VAT_OPTIONS } from '../../constants'
import type { ClientCreationImpactResponse } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import { formatShekelAmount } from '@/utils/utils'
import { stripNonDecimal } from '../../utils/createClientFormUtils'
import { CLIENTS_MESSAGES } from '../../messages'
import { CLIENTS_ERROR_MESSAGES } from '../../errorMessages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

interface Props {
  advisorOptions: Array<{ value: string; label: string }>
  advisorsLoading: boolean
  control: Control<CreateClientFormValues>
  disabled: boolean
  errors: FieldErrors<CreateClientFormValues>
  impactData?: ClientCreationImpactResponse
  impactError: boolean
  impactLoading: boolean
  isCompany: boolean
  isExempt: boolean
  register: UseFormRegister<CreateClientFormValues>
  showVatFrequency: boolean
}

export const CreateClientTaxStep: React.FC<Props> = ({
  advisorOptions,
  advisorsLoading,
  control,
  disabled,
  errors,
  impactData,
  impactError,
  impactLoading,
  isExempt,
  register,
  showVatFrequency,
}) => {
  const vatFrequencyValue = useWatch({ control, name: 'vat_reporting_frequency' })
  const advancePaymentFrequencyValue = useWatch({ control, name: 'advance_payment_frequency' })
  const accountantValue = useWatch({ control, name: 'accountant_id' })
  const vatExemptCeilingText = impactData
    ? impactData.vat_exempt_ceiling != null
      ? formatShekelAmount(impactData.vat_exempt_ceiling)
      : CLIENTS_MESSAGES.createTax.vatExemptCeilingMissing
    : CLIENTS_MESSAGES.createTax.vatExemptCeilingAuto

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">{CLIENTS_MESSAGES.createTax.intro}</p>
      {showVatFrequency && (
        <Select
          label={CLIENTS_MESSAGES.createTax.vatFrequencyLabel}
          error={errors.vat_reporting_frequency?.message}
          disabled={disabled}
          options={[
            { value: '', label: CLIENTS_MESSAGES.createTax.vatFrequencyPlaceholder },
            ...CREATE_CLIENT_VAT_OPTIONS,
          ]}
          value={vatFrequencyValue ?? ''}
          {...register('vat_reporting_frequency')}
        />
      )}
      <Select
        label={CLIENTS_MESSAGES.createTax.advanceFrequencyLabel}
        error={errors.advance_payment_frequency?.message}
        disabled={disabled}
        options={[
          { value: '', label: CLIENTS_MESSAGES.createTax.advanceFrequencyPlaceholder },
          ...ADVANCE_PAYMENT_FREQUENCY_OPTIONS,
        ]}
        value={advancePaymentFrequencyValue ?? ''}
        {...register('advance_payment_frequency')}
      />
      <div className="grid grid-cols-2 gap-4">
        {isExempt && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">{CLIENTS_MESSAGES.createTax.vatExemptCeiling}</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {impactLoading
                ? GLOBAL_UI_MESSAGES.common.loading
                : impactError
                  ? CLIENTS_ERROR_MESSAGES.create.vatExemptCeiling
                  : vatExemptCeilingText}
            </div>
            <p className="mt-1 text-xs text-gray-400">{CLIENTS_MESSAGES.createTax.vatExemptCeilingDerivedNote}</p>
          </div>
        )}
        <div className={isExempt ? undefined : 'col-span-1 max-w-[75%]'}>
          <Input
            label={CLIENTS_MESSAGES.createTax.advanceRateLabel}
            labelClassName="whitespace-nowrap"
            placeholder={CLIENTS_MESSAGES.createTax.advanceRatePlaceholder}
            error={errors.advance_rate?.message}
            disabled={disabled}
            onInput={stripNonDecimal}
            {...register('advance_rate')}
          />
        </div>
      </div>
      <Select
        label={CLIENTS_MESSAGES.createTax.accountantLabel}
        error={errors.accountant_id?.message}
        disabled={disabled || advisorsLoading}
        options={[
          {
            value: '',
            label: advisorsLoading
              ? CLIENTS_MESSAGES.createTax.accountantsLoading
              : CLIENTS_MESSAGES.createTax.accountantPlaceholder,
          },
          ...advisorOptions,
        ]}
        value={accountantValue ?? ''}
        {...register('accountant_id')}
      />
    </div>
  )
}
