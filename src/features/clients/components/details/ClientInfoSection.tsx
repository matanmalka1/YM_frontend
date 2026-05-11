import { type FC } from 'react'
import { SelectDropdown } from '@/components/ui/inputs/SelectDropdown'
import { formatDate, formatPhoneNumber, formatPlainIdentifier, formatShekelAmount } from '@/utils/utils'
import type { ClientRecordResponse } from '../../api'
import {
  ADVANCE_PAYMENT_FREQUENCY_LABELS,
  getClientStatusLabel,
  getClientVatReportingLabel,
} from '../../constants'
import { useClientAuthorityContacts } from '../../hooks/useClientAuthorityContacts'
import { useAdvisorOptions } from '@/features/users'
import { DefinitionSectionCard } from './ClientInfoSectionParts'

const TURNOVER_SOURCE_LABELS: Record<string, string> = {
  reported: 'מחושב מדיווחים',
  manual: 'הוזן ידנית',
  none: '',
}

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

type ClientInfoSectionProps = {
  client: ClientRecordResponse
  taxYear: number
  onTaxYearChange: (year: number) => void
  sideContent?: ReactNode
}

const EMPTY_VALUE = '—'

export const ClientInfoSection: FC<ClientInfoSectionProps> = ({ client, taxYear, onTaxYearChange, sideContent }) => {
  const { nameById } = useAdvisorOptions()
  const { officeByType } = useClientAuthorityContacts(client.id, client.address_city)

  const contactItems = [
    {
      label: 'טלפון',
      value: client.phone ? (
        <a href={`tel:${client.phone}`} className="text-primary-600 hover:underline">
          {formatPhoneNumber(client.phone)}
        </a>
      ) : (
        EMPTY_VALUE
      ),
    },
    {
      label: 'אימייל',
      value: client.email ? (
        <a href={`mailto:${client.email}`} className="text-primary-600 hover:underline">
          {client.email}
        </a>
      ) : (
        EMPTY_VALUE
      ),
    },
    { label: 'רחוב', value: client.address_street || EMPTY_VALUE },
    { label: 'מספר בניין', value: client.address_building_number || EMPTY_VALUE },
    { label: 'דירה', value: client.address_apartment || EMPTY_VALUE },
    { label: 'עיר', value: client.address_city || EMPTY_VALUE },
    { label: 'מיקוד', value: client.address_zip_code || EMPTY_VALUE },
  ]

  const isOsekPatur = client.entity_type === 'osek_patur'
  const vatReportingLabel = isOsekPatur
    ? 'פטור - לא רלוונטי לדיווח תקופתי'
    : getClientVatReportingLabel(client).replace('—', EMPTY_VALUE)
  const officeClientNumber = formatPlainIdentifier(client.office_client_number, EMPTY_VALUE)

  const taxItems = [
    {
      label: 'תדירות דיווח מע"מ',
      value: vatReportingLabel,
    },
    ...(isOsekPatur
      ? [
          {
            label: 'תקרת פטור מע"מ',
            value: client.vat_exempt_ceiling
              ? `${formatShekelAmount(client.vat_exempt_ceiling)} (ערך מערכת)`
              : EMPTY_VALUE,
          },
        ]
      : []),
    {
      label: 'אחוז מקדמה',
      value: client.advance_rate != null ? `${client.advance_rate}%` : 'לא אומת',
    },
    {
      label: 'תדירות מקדמות מס הכנסה',
      value: client.advance_payment_frequency
        ? ADVANCE_PAYMENT_FREQUENCY_LABELS[client.advance_payment_frequency]
        : EMPTY_VALUE,
    },
    {
      label: `מחזור שנתי (${taxYear})`,
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
      label: 'עדכון מקדמה',
      value: client.advance_rate_updated_at ? formatDate(client.advance_rate_updated_at) : EMPTY_VALUE,
    },
  ]

  const authorityItems = [
    { label: 'סניף מע"מ', value: officeByType('vat_branch') ?? EMPTY_VALUE },
    { label: 'סניף ביטוח לאומי', value: officeByType('national_insurance') ?? EMPTY_VALUE },
    { label: 'סניף מס הכנסה', value: officeByType('assessing_officer') ?? EMPTY_VALUE },
  ]

  const officeItems = [
    {
      label: 'מספר לקוח במשרד',
      value: officeClientNumber,
    },
    { label: 'מזהה מערכת', value: formatPlainIdentifier(client.id) },
    { label: 'סטטוס לקוח', value: getClientStatusLabel(client.status) },
    {
      label: 'רואה חשבון מלווה',
      value: client.accountant_id ? (nameById.get(client.accountant_id) ?? 'לא נמצא שם משתמש') : EMPTY_VALUE,
    },
    { label: 'נוצר בתאריך', value: formatDate(client.created_at) },
    {
      label: 'עודכן בתאריך',
      value: client.updated_at ? formatDate(client.updated_at) : EMPTY_VALUE,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DefinitionSectionCard title="פרטי קשר" items={contactItems} columns={2} />
        <DefinitionSectionCard
          title="פרופיל מס"
          items={taxItems}
          columns={2}
          headerAction={
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>שנת מס:</span>
              <select
                value={taxYear}
                onChange={(e) => onTaxYearChange(Number(e.target.value))}
                className="rounded border border-gray-200 bg-white px-2 py-0.5 text-sm text-gray-700 focus:outline-none"
              >
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <DefinitionSectionCard title="פרטי משרד" items={officeItems} columns={2} />
        <DefinitionSectionCard title="רשויות" items={authorityItems} columns={2} />
        {sideContent ? <div className="min-w-0">{sideContent}</div> : null}
      </div>
    </div>
  )
}
