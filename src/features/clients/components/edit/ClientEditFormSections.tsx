import type { ControllerRenderProps, FieldErrors, UseFormRegister } from 'react-hook-form'
import { Input } from '../../../../components/ui/inputs/Input'
import { Select } from '../../../../components/ui/inputs/Select'
import { useAdvisorOptions } from '@/features/users'
import type { ClientRecordResponse } from '../../api'
import {
  ADVANCE_PAYMENT_FREQUENCY_OPTIONS,
  CLIENT_ID_NUMBER_TYPE_LABELS,
  CLIENT_STATUS_OPTIONS,
  ENTITY_TYPE_OPTIONS,
  VAT_REPORTING_FREQUENCY_OPTIONS,
} from '../../constants'
import { formatDate, formatPlainIdentifier, formatShekelAmount } from '@/utils/utils'
import type { ClientEditFormValues } from '../../schemas'

type EntityTypeField = ControllerRenderProps<ClientEditFormValues, 'entity_type'>
type VatReportingFrequencyField = ControllerRenderProps<ClientEditFormValues, 'vat_reporting_frequency'>
type AdvancePaymentFrequencyField = ControllerRenderProps<ClientEditFormValues, 'advance_payment_frequency'>
type StatusField = ControllerRenderProps<ClientEditFormValues, 'status'>
type AccountantIdField = ControllerRenderProps<ClientEditFormValues, 'accountant_id'>

type SharedSectionProps = {
  client: ClientRecordResponse
  errors: FieldErrors<ClientEditFormValues>
  isLoading: boolean
  register: UseFormRegister<ClientEditFormValues>
}

const ReadonlyField = ({ label, value, help }: { label: string; value: string; help?: string }) => (
  <div className="space-y-1">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">{value}</p>
    {help ? <p className="text-xs text-gray-500">{help}</p> : null}
  </div>
)

export const ClientIdentitySection = ({
  client,
  errors,
  isLoading,
  register,
  entityTypeField,
}: SharedSectionProps & {
  entityTypeField: EntityTypeField
}) => (
  <section className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">זהות משפטית</h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input label="שם מלא *" error={errors.full_name?.message} disabled={isLoading} {...register('full_name')} />
      <Select
        label="סוג ישות"
        disabled={isLoading}
        options={[{ value: '', label: 'לא הוגדר' }, ...ENTITY_TYPE_OPTIONS]}
        value={entityTypeField.value ?? ''}
        onChange={entityTypeField.onChange}
        onBlur={entityTypeField.onBlur}
        name={entityTypeField.name}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <ReadonlyField
        label="מספר מזהה"
        value={client.id_number || 'לא הוגדר'}
        help="מנוהל כרשומת זהות ואינו ניתן לעריכה כאן."
      />
      <ReadonlyField
        label="סוג מזהה"
        value={client.id_number_type ? CLIENT_ID_NUMBER_TYPE_LABELS[client.id_number_type] : 'לא הוגדר'}
        help="שינוי סוג מזהה דורש תיקון רשומה."
      />
    </div>
  </section>
)

export const ClientContactSection = ({ errors, isLoading, register }: SharedSectionProps) => (
  <section className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">פרטי קשר</h3>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label="טלפון"
        placeholder="050-1234567"
        error={errors.phone?.message}
        disabled={isLoading}
        {...register('phone')}
      />
      <Input
        label='דוא"ל'
        type="email"
        placeholder="example@domain.com"
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email')}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label="רחוב"
        placeholder="שם הרחוב"
        error={errors.address_street?.message}
        disabled={isLoading}
        {...register('address_street')}
      />
      <Input
        label="מספר בניין"
        placeholder="מספר"
        error={errors.address_building_number?.message}
        disabled={isLoading}
        {...register('address_building_number')}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Input
        label="דירה"
        placeholder="מספר דירה"
        error={errors.address_apartment?.message}
        disabled={isLoading}
        {...register('address_apartment')}
      />
      <Input
        label="עיר"
        placeholder="שם העיר"
        error={errors.address_city?.message}
        disabled={isLoading}
        {...register('address_city')}
      />
      <Input
        label="מיקוד"
        placeholder="מיקוד"
        error={errors.address_zip_code?.message}
        disabled={isLoading}
        {...register('address_zip_code')}
      />
    </div>
  </section>
)

export const ClientTaxProfileSection = ({
  client,
  errors,
  isLoading,
  register,
  isOsekPatur,
  vatReportingFrequencyField,
  advancePaymentFrequencyField,
}: SharedSectionProps & {
  isOsekPatur: boolean
  vatReportingFrequencyField: VatReportingFrequencyField
  advancePaymentFrequencyField: AdvancePaymentFrequencyField
}) => {
  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">פרופיל מס</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isOsekPatur && (
          <ReadonlyField
            label="תדירות דיווח מע״מ"
            value="פטור - לא רלוונטי לדיווח תקופתי"
            help="עוסק פטור אינו מדווח מע״מ תקופתי, לכן השדה אינו ניתן לעריכה."
          />
        )}
        {!isOsekPatur && (
          <Select
            label="תדירות דיווח מע״מ"
            disabled={isLoading}
            options={[
              { value: '', label: 'לא הוגדר' },
              ...VAT_REPORTING_FREQUENCY_OPTIONS.filter((option) => option.value !== 'exempt'),
            ]}
            value={vatReportingFrequencyField.value ?? ''}
            onChange={vatReportingFrequencyField.onChange}
            onBlur={vatReportingFrequencyField.onBlur}
            name={vatReportingFrequencyField.name}
          />
        )}
        {isOsekPatur && (
          <ReadonlyField
            label="תקרת פטור מע״מ"
            value={formatShekelAmount(client.vat_exempt_ceiling, 'נקבע על ידי המערכת')}
            help="ערך מערכת/תצורה, לא שדה ידני."
          />
        )}
        <Select
          label="תדירות מקדמות מס הכנסה"
          disabled={isLoading}
          options={[{ value: '', label: 'לא הוגדר' }, ...ADVANCE_PAYMENT_FREQUENCY_OPTIONS]}
          value={advancePaymentFrequencyField.value ?? ''}
          onChange={advancePaymentFrequencyField.onChange}
          onBlur={advancePaymentFrequencyField.onBlur}
          name={advancePaymentFrequencyField.name}
        />
        <Input
          label="אחוז מקדמה %"
          placeholder="8.5"
          error={errors.advance_rate?.message}
          disabled={isLoading}
          {...register('advance_rate')}
        />
        <ReadonlyField
          label="תאריך עדכון מקדמה"
          value={client.advance_rate_updated_at ? formatDate(client.advance_rate_updated_at) : 'לא זמין'}
          help="מתעדכן רק כשקיים מקור עדכון במערכת."
        />
        <Input
          label="מחזור שנתי (₪)"
          placeholder="500000"
          error={errors.annual_revenue?.message}
          disabled={isLoading}
          {...register('annual_revenue')}
        />
      </div>
    </section>
  )
}

export const ClientOfficeSection = ({
  client,
  errors,
  isLoading,
  statusField,
  accountantIdField,
}: SharedSectionProps & {
  statusField: StatusField
  accountantIdField: AccountantIdField
}) => {
  const { options: advisorOptions, isLoading: advisorsLoading } = useAdvisorOptions()

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">פרטי משרד</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ReadonlyField
          label="מספר לקוח במשרד"
          value={formatPlainIdentifier(client.office_client_number, 'לא הוגדר')}
          help="מזהה משרד ראשי להצגה, מנוהל על ידי המערכת."
        />
        <ReadonlyField
          label="מזהה מערכת"
          value={formatPlainIdentifier(client.id)}
          help="מזהה פנימי לצורכי תמיכה ובקרה בלבד."
        />
      </div>

      <Select
        label="סטטוס לקוח"
        disabled={isLoading}
        options={CLIENT_STATUS_OPTIONS}
        value={statusField.value}
        onChange={statusField.onChange}
        onBlur={statusField.onBlur}
        name={statusField.name}
      />
      <Select
        label="רואה חשבון מלווה"
        error={errors.accountant_id?.message}
        disabled={isLoading || advisorsLoading}
        options={[{ value: '', label: advisorsLoading ? 'טוען רואי חשבון...' : 'לא הוגדר' }, ...advisorOptions]}
        value={accountantIdField.value ?? ''}
        onChange={accountantIdField.onChange}
        onBlur={accountantIdField.onBlur}
        name={accountantIdField.name}
      />
    </section>
  )
}
