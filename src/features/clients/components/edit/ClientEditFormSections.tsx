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
import { CLIENTS_MESSAGES } from '../../messages'

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
    <h3 className="text-lg font-semibold text-gray-900">{CLIENTS_MESSAGES.edit.sectionIdentity}</h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label={CLIENTS_MESSAGES.edit.fullName}
        error={errors.full_name?.message}
        disabled={isLoading}
        {...register('full_name')}
      />
      <Select
        label={CLIENTS_MESSAGES.edit.entityType}
        disabled={isLoading}
        options={[{ value: '', label: CLIENTS_MESSAGES.edit.notDefined }, ...ENTITY_TYPE_OPTIONS]}
        value={entityTypeField.value ?? ''}
        onChange={entityTypeField.onChange}
        onBlur={entityTypeField.onBlur}
        name={entityTypeField.name}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <ReadonlyField
        label={CLIENTS_MESSAGES.edit.idNumber}
        value={client.id_number || CLIENTS_MESSAGES.edit.notDefined}
        help={CLIENTS_MESSAGES.edit.idNumberHelp}
      />
      <ReadonlyField
        label={CLIENTS_MESSAGES.edit.idNumberType}
        value={
          client.id_number_type ? CLIENT_ID_NUMBER_TYPE_LABELS[client.id_number_type] : CLIENTS_MESSAGES.edit.notDefined
        }
        help={CLIENTS_MESSAGES.edit.idNumberTypeHelp}
      />
    </div>
  </section>
)

export const ClientContactSection = ({ errors, isLoading, register }: SharedSectionProps) => (
  <section className="space-y-4">
    <h3 className="text-lg font-semibold text-gray-900">{CLIENTS_MESSAGES.edit.sectionContact}</h3>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label={CLIENTS_MESSAGES.edit.phone}
        placeholder="050-1234567"
        error={errors.phone?.message}
        disabled={isLoading}
        {...register('phone')}
      />
      <Input
        label={CLIENTS_MESSAGES.edit.emailLabel}
        type="email"
        placeholder="example@domain.com"
        error={errors.email?.message}
        disabled={isLoading}
        {...register('email')}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label={CLIENTS_MESSAGES.edit.street}
        placeholder={CLIENTS_MESSAGES.edit.streetPlaceholder}
        error={errors.address_street?.message}
        disabled={isLoading}
        {...register('address_street')}
      />
      <Input
        label={CLIENTS_MESSAGES.edit.buildingNumber}
        placeholder={CLIENTS_MESSAGES.edit.buildingNumberPlaceholder}
        error={errors.address_building_number?.message}
        disabled={isLoading}
        {...register('address_building_number')}
      />
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Input
        label={CLIENTS_MESSAGES.edit.apartment}
        placeholder={CLIENTS_MESSAGES.edit.apartmentPlaceholder}
        error={errors.address_apartment?.message}
        disabled={isLoading}
        {...register('address_apartment')}
      />
      <Input
        label={CLIENTS_MESSAGES.edit.city}
        placeholder={CLIENTS_MESSAGES.edit.cityPlaceholder}
        error={errors.address_city?.message}
        disabled={isLoading}
        {...register('address_city')}
      />
      <Input
        label={CLIENTS_MESSAGES.edit.zipCode}
        placeholder={CLIENTS_MESSAGES.edit.zipCodePlaceholder}
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
      <h3 className="text-lg font-semibold text-gray-900">{CLIENTS_MESSAGES.edit.sectionTaxProfile}</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {isOsekPatur && (
          <ReadonlyField
            label={CLIENTS_MESSAGES.edit.vatReportingFrequency}
            value={CLIENTS_MESSAGES.edit.vatReportingExempt}
            help={CLIENTS_MESSAGES.edit.vatReportingExemptHelp}
          />
        )}
        {!isOsekPatur && (
          <Select
            label={CLIENTS_MESSAGES.edit.vatReportingFrequency}
            disabled={isLoading}
            options={[
              { value: '', label: CLIENTS_MESSAGES.edit.notDefined },
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
            label={CLIENTS_MESSAGES.edit.vatExemptCeiling}
            value={formatShekelAmount(client.vat_exempt_ceiling, CLIENTS_MESSAGES.edit.vatExemptCeilingFallback)}
            help={CLIENTS_MESSAGES.edit.vatExemptCeilingHelp}
          />
        )}
        <Select
          label={CLIENTS_MESSAGES.edit.advancePaymentFrequency}
          disabled={isLoading}
          options={[{ value: '', label: CLIENTS_MESSAGES.edit.notDefined }, ...ADVANCE_PAYMENT_FREQUENCY_OPTIONS]}
          value={advancePaymentFrequencyField.value ?? ''}
          onChange={advancePaymentFrequencyField.onChange}
          onBlur={advancePaymentFrequencyField.onBlur}
          name={advancePaymentFrequencyField.name}
        />
        <Input
          label={CLIENTS_MESSAGES.edit.advanceRate}
          placeholder="8.5"
          error={errors.advance_rate?.message}
          disabled={isLoading}
          {...register('advance_rate')}
        />
        <ReadonlyField
          label={CLIENTS_MESSAGES.edit.advanceRateUpdatedAt}
          value={
            client.advance_rate_updated_at ? formatDate(client.advance_rate_updated_at) : CLIENTS_MESSAGES.edit.notAvailable
          }
          help={CLIENTS_MESSAGES.edit.advanceRateUpdatedAtHelp}
        />
        <Input
          label={CLIENTS_MESSAGES.edit.annualTurnover}
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
      <h3 className="text-lg font-semibold text-gray-900">{CLIENTS_MESSAGES.edit.sectionOffice}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ReadonlyField
          label={CLIENTS_MESSAGES.edit.officeClientNumber}
          value={formatPlainIdentifier(client.office_client_number, CLIENTS_MESSAGES.edit.notDefined)}
          help={CLIENTS_MESSAGES.edit.officeClientNumberHelp}
        />
        <ReadonlyField
          label={CLIENTS_MESSAGES.edit.systemId}
          value={formatPlainIdentifier(client.id)}
          help={CLIENTS_MESSAGES.edit.systemIdHelp}
        />
      </div>

      <Select
        label={CLIENTS_MESSAGES.edit.clientStatus}
        disabled={isLoading}
        options={CLIENT_STATUS_OPTIONS}
        value={statusField.value}
        onChange={statusField.onChange}
        onBlur={statusField.onBlur}
        name={statusField.name}
      />
      <Select
        label={CLIENTS_MESSAGES.edit.accountant}
        error={errors.accountant_id?.message}
        disabled={isLoading || advisorsLoading}
        options={[
          {
            value: '',
            label: advisorsLoading ? CLIENTS_MESSAGES.edit.accountantsLoading : CLIENTS_MESSAGES.edit.notDefined,
          },
          ...advisorOptions,
        ]}
        value={accountantIdField.value ?? ''}
        onChange={accountantIdField.onChange}
        onBlur={accountantIdField.onBlur}
        name={accountantIdField.name}
      />
    </section>
  )
}
