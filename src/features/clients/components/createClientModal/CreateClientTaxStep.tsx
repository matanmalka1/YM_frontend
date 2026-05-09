import { useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { ADVANCE_PAYMENT_FREQUENCY_OPTIONS, CREATE_CLIENT_VAT_OPTIONS } from '../../constants'
import type { ClientCreationImpactResponse } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import { formatShekelAmount } from '@/utils/utils'
import { stripNonDecimal } from './createClientFormUtils'

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
  isCompany,
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
      : 'לא נמצאה תקרת פטור בהגדרות המערכת'
    : 'תקרת עוסק פטור תיקבע אוטומטית לפי שנת המס.'

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">בדוק את הגדרות המס לפני יצירת הלקוח.</p>
      {showVatFrequency && (
        <Select
          label="תדירות דיווח מע״מ *"
          error={errors.vat_reporting_frequency?.message}
          disabled={disabled}
          options={[{ value: '', label: 'בחר תדירות דיווח' }, ...CREATE_CLIENT_VAT_OPTIONS]}
          value={vatFrequencyValue ?? ''}
          {...register('vat_reporting_frequency')}
        />
      )}
      <Select
        label="תדירות מקדמות מס הכנסה *"
        error={errors.advance_payment_frequency?.message}
        disabled={disabled}
        options={[{ value: '', label: 'בחר תדירות מקדמות' }, ...ADVANCE_PAYMENT_FREQUENCY_OPTIONS]}
        value={advancePaymentFrequencyValue ?? ''}
        {...register('advance_payment_frequency')}
      />
      <div className="grid grid-cols-2 gap-4">
        {isExempt && (
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">תקרת פטור מע״מ</p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {impactLoading ? 'טוען...' : impactError ? 'לא ניתן לטעון את תקרת הפטור כרגע' : vatExemptCeilingText}
            </div>
            <p className="mt-1 text-xs text-gray-400">נגזר אוטומטית לפי הגדרת המערכת</p>
          </div>
        )}
        <Input
          label="שיעור מקדמות מס הכנסה (%)"
          placeholder="ריק = אין מקדמות / לא ידוע"
          error={errors.advance_rate?.message}
          disabled={disabled}
          onInput={stripNonDecimal}
          {...register('advance_rate')}
        />
      </div>
      <Select
        label="רואה חשבון מלווה"
        error={errors.accountant_id?.message}
        disabled={disabled || advisorsLoading}
        options={[{ value: '', label: advisorsLoading ? 'טוען רואי חשבון...' : 'בחר רואה חשבון' }, ...advisorOptions]}
        value={accountantValue ?? ''}
        {...register('accountant_id')}
      />
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4" dir="rtl">
        <p className="mb-2 text-sm font-semibold text-blue-800">מה ייווצר לאחר שמירה?</p>
        {impactLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-blue-100" />
            ))}
          </div>
        ) : impactData ? (
          <>
            <ul className="space-y-1">
              {impactData.items.map((item) => (
                <li key={item.label} className="flex items-baseline gap-2 text-sm text-blue-700">
                  <span className="font-medium">{item.count}</span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            {impactData.note && <p className="mt-2 text-xs text-blue-600">{impactData.note}</p>}
            {impactData.years_scope === 2 && (
              <p className="mt-1 text-xs text-blue-600">ייווצר עבור השנה הנוכחית והשנה הבאה</p>
            )}
          </>
        ) : (
          <p className="text-sm text-blue-700">
            {isExempt
              ? 'ייווצר קלסר ודוח שנתי. מועדי מע"מ תקופתיים לא ייווצרו'
              : isCompany
                ? 'ייווצר קלסר, מועדי מע"מ לפי תדירות ודוח שנתי לחברה'
                : 'ייווצר קלסר, מועדי מע"מ לפי תדירות ודוח שנתי'}
          </p>
        )}
      </div>
    </div>
  )
}
