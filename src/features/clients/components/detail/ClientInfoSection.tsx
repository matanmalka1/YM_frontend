import { type FC } from 'react'
import { formatAdvanceRatePercent, formatDate, formatPhoneNumber, formatPlainIdentifier, formatShekelAmount } from '@/utils/utils'
import type { ClientRecordResponse } from '../../api'
import {
  ADVANCE_PAYMENT_FREQUENCY_LABELS,
  TURNOVER_SOURCE_LABELS,
  getClientStatusLabel,
  getClientVatReportingLabel,
} from '../../constants'
import { useClientAuthorityContacts } from '../../hooks/useClientAuthorityContacts'
import { useAdvisorOptions } from '@/features/users'
import { InlineLink } from '@/components/ui/primitives/InlineLink'
import { DefinitionSectionCard, EMPTY_VALUE } from './ClientInfoSectionParts'
import { CLIENTS_MESSAGES } from '../../messages'

type ClientInfoSectionProps = {
  client: ClientRecordResponse
}

export const ClientInfoSection: FC<ClientInfoSectionProps> = ({ client }) => {
  const { nameById } = useAdvisorOptions()
  const { officeByType } = useClientAuthorityContacts(client.id, client.address_city)

  const contactItems = [
    {
      label: CLIENTS_MESSAGES.info.phone,
      value: client.phone ? <InlineLink href={`tel:${client.phone}`}>{formatPhoneNumber(client.phone)}</InlineLink> : EMPTY_VALUE,
    },
    {
      label: CLIENTS_MESSAGES.info.email,
      value: client.email ? <InlineLink href={`mailto:${client.email}`}>{client.email}</InlineLink> : EMPTY_VALUE,
    },
    { label: CLIENTS_MESSAGES.info.street, value: client.address_street || EMPTY_VALUE },
    { label: CLIENTS_MESSAGES.info.buildingNumber, value: client.address_building_number || EMPTY_VALUE },
    { label: CLIENTS_MESSAGES.info.apartment, value: client.address_apartment || EMPTY_VALUE },
    { label: CLIENTS_MESSAGES.info.city, value: client.address_city || EMPTY_VALUE },
    { label: CLIENTS_MESSAGES.info.zipCode, value: client.address_zip_code || EMPTY_VALUE },
  ]

  const isOsekPatur = client.entity_type === 'osek_patur'
  const vatReportingLabel = isOsekPatur
    ? CLIENTS_MESSAGES.info.vatReportingExempt
    : getClientVatReportingLabel(client).replace('—', EMPTY_VALUE)
  const officeClientNumber = formatPlainIdentifier(client.office_client_number, EMPTY_VALUE)

  const taxItems = [
    {
      label: CLIENTS_MESSAGES.info.vatReportingFrequency,
      value: vatReportingLabel,
    },
    ...(isOsekPatur
      ? [
          {
            label: CLIENTS_MESSAGES.info.vatExemptCeiling,
            value: client.vat_exempt_ceiling
              ? CLIENTS_MESSAGES.info.systemValueSuffix(formatShekelAmount(client.vat_exempt_ceiling))
              : EMPTY_VALUE,
          },
        ]
      : []),
    {
      label: CLIENTS_MESSAGES.info.advanceRate,
      value:
        client.advance_rate != null
          ? formatAdvanceRatePercent(client.advance_rate)
          : CLIENTS_MESSAGES.info.advanceRateNotVerified,
    },
    {
      label: CLIENTS_MESSAGES.info.advancePaymentFrequency,
      value: client.advance_payment_frequency ? ADVANCE_PAYMENT_FREQUENCY_LABELS[client.advance_payment_frequency] : EMPTY_VALUE,
    },
    {
      label: CLIENTS_MESSAGES.info.annualTurnover,
      value:
        !client.annual_turnover || client.annual_turnover.source === 'none' ? (
          EMPTY_VALUE
        ) : (
          <span className="flex items-center gap-1.5">
            {formatShekelAmount(client.annual_turnover.amount)}
            <span className="text-xs text-gray-400">({TURNOVER_SOURCE_LABELS[client.annual_turnover.source]})</span>
          </span>
        ),
    },
    {
      label: CLIENTS_MESSAGES.info.advanceUpdate,
      value: client.advance_rate_updated_at ? formatDate(client.advance_rate_updated_at) : EMPTY_VALUE,
    },
  ]

  const authorityItems = [
    { label: CLIENTS_MESSAGES.info.vatBranch, value: officeByType('vat_branch') ?? EMPTY_VALUE },
    { label: CLIENTS_MESSAGES.info.nationalInsuranceBranch, value: officeByType('national_insurance') ?? EMPTY_VALUE },
    { label: CLIENTS_MESSAGES.info.assessingOfficerBranch, value: officeByType('assessing_officer') ?? EMPTY_VALUE },
  ]

  const officeItems = [
    {
      label: CLIENTS_MESSAGES.info.officeClientNumber,
      value: officeClientNumber,
    },
    { label: CLIENTS_MESSAGES.info.systemId, value: formatPlainIdentifier(client.id) },
    { label: CLIENTS_MESSAGES.info.clientStatus, value: getClientStatusLabel(client.status) },
    {
      label: CLIENTS_MESSAGES.info.accountant,
      value: client.accountant_id
        ? (nameById.get(client.accountant_id) ?? CLIENTS_MESSAGES.info.accountantNameMissing)
        : EMPTY_VALUE,
    },
    { label: CLIENTS_MESSAGES.info.createdAt, value: formatDate(client.created_at) },
    {
      label: CLIENTS_MESSAGES.info.updatedAt,
      value: client.updated_at ? formatDate(client.updated_at) : EMPTY_VALUE,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DefinitionSectionCard title={CLIENTS_MESSAGES.info.sectionContact} items={contactItems} columns={2} />
        <DefinitionSectionCard title={CLIENTS_MESSAGES.info.sectionTaxProfile} items={taxItems} columns={2} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DefinitionSectionCard title={CLIENTS_MESSAGES.info.sectionOffice} items={officeItems} columns={2} />
        <DefinitionSectionCard title={CLIENTS_MESSAGES.info.sectionAuthorities} items={authorityItems} columns={2} />
      </div>
    </div>
  )
}
