import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Alert } from '@/components/ui'
import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { ClientSearchInput } from '@/components/shared/client'
import { DatePicker } from '@/components/ui'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui'
import { isClientLockedForCreate } from '@/utils/clientStatus'
import { getStatusLabel, type AnnualReportFull } from '@/features/annualReports'
import { BINDER_TYPE_OPTIONS } from '../../constants'
import type { ReceiveBinderFormValues } from '../../schemas'
import { BinderPeriodFields } from './BinderPeriodFields'

export interface BinderReceivePanelProps {
  form: UseFormReturn<ReceiveBinderFormValues>
  clientQuery: string
  selectedClient: { id: number; name: string; client_status?: string | null } | null
  businesses: { id: number; business_name: string | null }[]
  annualReports: AnnualReportFull[]
  hasActiveBinder: boolean
  vatType: 'monthly' | 'bimonthly' | 'exempt' | null
  onClientSelect: (client: { id: number; name: string; id_number: string; client_status?: string | null }) => void
  onClientQueryChange: (query: string) => void
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  onClose: () => void
  isSubmitting: boolean
}

export const BinderReceivePanel: React.FC<BinderReceivePanelProps> = ({
  form,
  clientQuery,
  selectedClient,
  businesses,
  annualReports,
  hasActiveBinder,
  vatType,
  onClientSelect,
  onClientQueryChange,
  onSubmit,
  onClose,
  isSubmitting,
}) => {
  const {
    register,
    control,
    formState: { errors },
  } = form
  const binderType = form.watch('binder_type')

  const clientLocked = isClientLockedForCreate(selectedClient?.client_status)

  const businessOptions = [
    { value: '', label: 'בחר עסק...', disabled: true },
    ...(businesses.length > 1 ? [{ value: 'all', label: 'כל העסקים' }] : []),
    ...businesses.map((b) => ({ value: String(b.id), label: b.business_name ?? `עסק #${b.id}` })),
  ]

  const annualReportOptions = [
    {
      value: '',
      label: annualReports.length > 0 ? 'ללא קישור לדוח שנתי' : 'אין דוחות שנתיים לעסק זה',
    },
    ...annualReports.map((report) => ({
      value: String(report.id),
      label: `${report.tax_year} — ${getStatusLabel(report.status)}`,
    })),
  ]

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <ClientSearchInput
        value={clientQuery}
        onChange={onClientQueryChange}
        onSelect={onClientSelect}
        error={
          errors.client_record_id?.message ??
          (!selectedClient && clientQuery.length > 0 ? 'נא לבחור לקוח מהרשימה' : undefined)
        }
      />

      {selectedClient && (
        <p className="text-xs text-positive-700 font-medium -mt-2">
          ✓ נבחר: {selectedClient.name} (#{selectedClient.id})
        </p>
      )}

      {selectedClient && clientLocked && (
        <Alert
          variant={selectedClient.client_status === 'closed' ? 'error' : 'warning'}
          message={
            selectedClient.client_status === 'closed'
              ? 'לקוח סגור – לא ניתן לקלוט קלסר'
              : 'לקוח מוקפא – לא ניתן לקלוט קלסר חדש'
          }
        />
      )}

      <Select
        label="סוג חומר"
        error={errors.binder_type?.message}
        options={BINDER_TYPE_OPTIONS}
        {...register('binder_type')}
      />

      {selectedClient && binderType === 'vat' && businesses.length > 0 && (
        <Controller
          name="business_id"
          control={control}
          render={({ field }) => (
            <Select
              label="עסק"
              error={errors.business_id?.message}
              options={businessOptions}
              value={field.value === null ? 'all' : field.value !== undefined ? String(field.value) : ''}
              onChange={(e) => {
                const v = e.target.value
                if (v === '') {
                  field.onChange(undefined)
                  return
                }
                if (v === 'all') {
                  field.onChange(null)
                  return
                }
                field.onChange(Number(v))
              }}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
      )}

      {selectedClient && binderType && <BinderPeriodFields form={form} materialType={binderType} vatType={vatType} />}

      {selectedClient && binderType === 'annual_report' && (
        <Controller
          name="annual_report_id"
          control={control}
          render={({ field }) => (
            <Select
              label="דוח שנתי"
              error={errors.annual_report_id?.message}
              options={annualReportOptions}
              value={field.value != null ? String(field.value) : ''}
              onChange={(e) => {
                field.onChange(e.target.value ? Number(e.target.value) : null)
              }}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
      )}

      <Controller
        name="received_at"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="תאריך קבלה"
            error={errors.received_at?.message}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />

      {selectedClient && hasActiveBinder && (
        <Checkbox
          {...register('open_new_binder')}
          label="קלסר מלא – פתח קלסר חדש"
          containerClassName="text-amber-700"
          inputClassName="mt-0.5"
        />
      )}

      <Textarea label="הערות" rows={3} placeholder="הערות פנימיות (אופציונלי)" {...register('notes')} />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          ביטול
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting || clientLocked}>
          קליטה
        </Button>
      </div>
    </form>
  )
}

BinderReceivePanel.displayName = 'BinderReceivePanel'
