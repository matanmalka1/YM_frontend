import type { UseFormReturn } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { Alert } from '@/components/ui'
import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { ClientSearchInput } from '@/components/shared/client'
import { DatePicker } from '@/components/ui'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui'
import { useOverlayDismiss } from '@/components/ui/overlays/useOverlayDismiss'
import { isClientLockedForCreate } from '@/utils/clientStatus'
import { getStatusLabel, type AnnualReportListItem } from '@/features/annualReports'
import { MONTH_OPTIONS } from '@/constants/periodOptions.constants'
import { BINDER_TYPE_OPTIONS, PERIODIC_BINDER_TYPES } from '../../constants'
import type { ReceiveBinderFormValues } from '../../schemas'
import { BinderPeriodFields } from './BinderPeriodFields'
import { BINDERS_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

export interface BinderReceivePanelProps {
  form: UseFormReturn<ReceiveBinderFormValues>
  clientQuery: string
  selectedClient: { id: number; name: string; client_status?: string | null } | null
  businesses: { id: number; business_name: string | null }[]
  annualReports: AnnualReportListItem[]
  hasActiveBinder: boolean
  vatType: 'monthly' | 'bimonthly' | 'exempt' | null
  onClientSelect: (client: { id: number; name: string; id_number: string; client_status?: string | null }) => void
  onClientQueryChange: (query: string) => void
  onSubmit: (e?: React.BaseSyntheticEvent) => void
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
  isSubmitting,
}) => {
  const dismiss = useOverlayDismiss()
  const {
    register,
    control,
    formState: { errors },
  } = form
  const binderTypes = form.watch('binder_types') ?? []
  const selectedBinderTypes = new Set(binderTypes)
  const hasSelectedTypes = binderTypes.length > 0
  const hasVatMaterial = selectedBinderTypes.has('vat')
  const hasSalaryMaterial = selectedBinderTypes.has('salary')
  const hasAnnualReportMaterial = selectedBinderTypes.has('annual_report')
  const periodMaterialType = hasVatMaterial
    ? 'vat'
    : (binderTypes.find((type) => PERIODIC_BINDER_TYPES.has(type)) ?? binderTypes[0])
  const periodMonthStart = form.watch('period_month_start')
  const periodMonthEnd = form.watch('period_month_end')

  const clientLocked = isClientLockedForCreate(selectedClient?.client_status)

  const businessOptions = [
    { value: '', label: BINDERS_MESSAGES.receive.chooseBusiness, disabled: true },
    ...(businesses.length > 1 ? [{ value: 'all', label: BINDERS_MESSAGES.receive.allBusinesses }] : []),
    ...businesses.map((b) => ({
      value: String(b.id),
      label: b.business_name ?? BINDERS_MESSAGES.receive.businessOption(b.id),
    })),
  ]

  const annualReportOptions = [
    {
      value: '',
      label:
        annualReports.length > 0
          ? BINDERS_MESSAGES.receive.noAnnualReportLink
          : BINDERS_MESSAGES.receive.noAnnualReportsForBusiness,
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
          (!selectedClient && clientQuery.length > 0 ? BINDERS_MESSAGES.receive.clientSelectionRequired : undefined)
        }
      />

      {selectedClient && (
        <p className="text-xs text-positive-700 font-medium -mt-2">
          {BINDERS_MESSAGES.receive.selectedClient(selectedClient.name, selectedClient.id)}
        </p>
      )}

      {selectedClient && clientLocked && (
        <Alert
          variant={selectedClient.client_status === 'closed' ? 'error' : 'warning'}
          message={
            selectedClient.client_status === 'closed'
              ? BINDERS_MESSAGES.receive.closedClient
              : BINDERS_MESSAGES.receive.frozenClient
          }
        />
      )}

      <Controller
        name="binder_types"
        control={control}
        render={({ field }) => {
          const selectedTypes = field.value ?? []

          return (
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">{BINDERS_MESSAGES.receive.materialType}</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {BINDER_TYPE_OPTIONS.filter((option) => option.value !== '').map((option) => (
                  <Checkbox
                    key={option.value}
                    size="sm"
                    label={option.label}
                    checked={selectedTypes.includes(option.value as ReceiveBinderFormValues['binder_types'][number])}
                    onChange={(event) => {
                      const nextType = option.value as ReceiveBinderFormValues['binder_types'][number]
                      field.onChange(
                        event.target.checked
                          ? [...selectedTypes, nextType]
                          : selectedTypes.filter((type) => type !== nextType),
                      )
                    }}
                  />
                ))}
              </div>
              {errors.binder_types?.message && (
                <p className="text-xs text-negative-600">{errors.binder_types.message}</p>
              )}
            </div>
          )
        }}
      />

      {selectedClient && hasVatMaterial && businesses.length > 0 && (
        <Controller
          name="business_id"
          control={control}
          render={({ field }) => (
            <Select
              label={BINDERS_MESSAGES.receive.business}
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

      {selectedClient && hasSelectedTypes && (
        <BinderPeriodFields form={form} materialType={periodMaterialType} vatType={vatType} />
      )}

      {selectedClient && hasVatMaterial && hasSalaryMaterial && (
        <Controller
          name="salary_month"
          control={control}
          render={({ field }) => {
            const salaryMonthOptions =
              periodMonthStart && periodMonthEnd
                ? MONTH_OPTIONS.filter((option) => [periodMonthStart, periodMonthEnd].includes(Number(option.value)))
                : MONTH_OPTIONS

            return (
              <Select
                label={BINDERS_MESSAGES.receive.salaryMonth}
                error={errors.salary_month?.message}
                options={[
                  { value: '', label: BINDERS_MESSAGES.receive.chooseSalaryMonth, disabled: true },
                  ...salaryMonthOptions,
                ]}
                value={field.value ? String(field.value) : ''}
                onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                onBlur={field.onBlur}
                name={field.name}
              />
            )
          }}
        />
      )}

      {selectedClient && hasAnnualReportMaterial && (
        <Controller
          name="annual_report_id"
          control={control}
          render={({ field }) => (
            <Select
              label={BINDERS_MESSAGES.receive.annualReport}
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
            label={BINDERS_MESSAGES.receive.receivedAt}
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
          label={BINDERS_MESSAGES.receive.openNewBinder}
          containerClassName="text-warning-700"
          inputClassName="mt-0.5"
        />
      )}

      <Textarea
        label={BINDERS_MESSAGES.receive.notes}
        rows={3}
        placeholder={BINDERS_MESSAGES.receive.notesPlaceholder}
        {...register('notes')}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={dismiss}>
          {GLOBAL_UI_MESSAGES.actions.cancel}
        </Button>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting || clientLocked}>
          {BINDERS_MESSAGES.actions.intake}
        </Button>
      </div>
    </form>
  )
}

BinderReceivePanel.displayName = 'BinderReceivePanel'
