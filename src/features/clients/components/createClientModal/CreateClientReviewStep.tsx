import { CreditCard, FileText, FolderOpen, ReceiptText } from 'lucide-react'

import type { ClientCreationImpactResponse } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import { ADVANCE_PAYMENT_FREQUENCY_LABELS, ENTITY_TYPE_LABELS, VAT_TYPE_LABELS } from '../../constants'
import { formatDate } from '@/utils/utils'

interface Props {
  values: CreateClientFormValues
  advisorOptions: Array<{ value: string; label: string }>
  impactData?: ClientCreationImpactResponse
  impactLoading: boolean
  impactError: boolean
}

interface ReviewRowProps {
  label: string
  value: string | null | undefined
}

const ReviewRow: React.FC<ReviewRowProps> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-sm text-gray-500 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-900 text-left">{value || '—'}</span>
  </div>
)

interface SectionProps {
  title: string
  children: React.ReactNode
}

const impactIconClasses = 'h-4 w-4'

const impactIconByLabel = {
  'קלסר פעיל': FolderOpen,
  'דוחות מע"מ': ReceiptText,
  'תשלומי מקדמות': CreditCard,
  'דוח שנתי': FileText,
} as const

const ImpactIcon: React.FC<{ label: string }> = ({ label }) => {
  const Icon = impactIconByLabel[label as keyof typeof impactIconByLabel] ?? FileText
  return <Icon className={impactIconClasses} aria-hidden="true" />
}

const ReviewSection: React.FC<SectionProps> = ({ title, children }) => (
  <div className="rounded-lg border border-gray-200 overflow-hidden">
    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
    </div>
    <div className="px-4 py-1">{children}</div>
  </div>
)

export const CreateClientReviewStep: React.FC<Props> = ({
  values,
  advisorOptions,
  impactData,
  impactLoading,
  impactError,
}) => {
  const entityLabel = values.entity_type ? ENTITY_TYPE_LABELS[values.entity_type] : null
  const isExempt = values.entity_type === 'osek_patur'
  const isCompany = values.entity_type === 'company_ltd'

  const vatLabel = isExempt
    ? 'פטור'
    : values.vat_reporting_frequency
      ? VAT_TYPE_LABELS[values.vat_reporting_frequency]
      : null

  const advanceLabel = values.advance_payment_frequency
    ? ADVANCE_PAYMENT_FREQUENCY_LABELS[values.advance_payment_frequency]
    : null

  const advisorLabel = advisorOptions.find((o) => o.value === values.accountant_id)?.label

  const businessDisplayName = isCompany ? values.full_name?.trim() : values.business_name?.trim() || values.full_name?.trim()

  const impactTotal = impactData?.items.reduce((sum, item) => sum + item.count, 0) ?? 0

  const addressParts = [
    values.address_street,
    values.address_building_number,
    values.address_apartment,
    values.address_city,
    values.address_zip_code,
  ]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-4" dir="rtl">
      <p className="text-xs text-gray-500">בדוק את הפרטים לפני יצירת הלקוח.</p>

      <ReviewSection title="זיהוי">
        <ReviewRow label="סוג ישות" value={entityLabel} />
        <ReviewRow label={isCompany ? 'שם חברה' : 'שם מלא'} value={values.full_name} />
        <ReviewRow label={isCompany ? 'ח.פ' : 'ת.ז'} value={values.id_number} />
      </ReviewSection>

      <ReviewSection title={isCompany ? 'חברה ופרטי קשר' : 'עסק ופרטי קשר'}>
        <ReviewRow label={isCompany ? 'שם חברה' : 'שם עסק'} value={businessDisplayName} />
        <ReviewRow
          label={isCompany ? 'תאריך התאגדות' : 'תאריך פתיחת תיק'}
          value={formatDate(values.business_opened_at ?? null)}
        />
        <ReviewRow label="טלפון" value={values.phone} />
        <ReviewRow label="אימייל" value={values.email} />
        <ReviewRow label="כתובת" value={addressParts || null} />
      </ReviewSection>

      <ReviewSection title="מס ומע״מ">
        {!isExempt && <ReviewRow label="תדירות דיווח מע״מ" value={vatLabel} />}
        <ReviewRow label="תדירות מקדמות" value={advanceLabel} />
        <ReviewRow label="שיעור מקדמות" value={values.advance_rate ? `${values.advance_rate}%` : null} />
        <ReviewRow label="רואה חשבון" value={advisorLabel ?? null} />
      </ReviewSection>

      <div className="rounded-lg border border-blue-200 bg-blue-50/70 p-4" dir="rtl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-blue-900">מה ייווצר לאחר שמירה?</p>
            <p className="mt-0.5 text-xs text-blue-700">פריטים חדשים שייווצרו עבור הלקוח</p>
          </div>
          {impactData && (
            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100">
              {impactTotal} פריטים
            </span>
          )}
        </div>
        {impactLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-blue-100" />
            ))}
          </div>
        ) : impactError ? (
          <p className="text-sm text-blue-700">לא ניתן לטעון את הפרטים כרגע</p>
        ) : impactData ? (
          <>
            <ul className="grid gap-2 sm:grid-cols-2">
              {impactData.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-md bg-white px-3 py-2.5 text-blue-900 shadow-sm ring-1 ring-blue-100"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                    <ImpactIcon label={item.label} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold leading-5 text-blue-950">{item.count}</span>
                    <span className="block truncate text-xs font-medium text-blue-700">{item.label}</span>
                  </span>
                </li>
              ))}
            </ul>
            {impactData.note && <p className="mt-2 text-xs text-blue-600">{impactData.note}</p>}
            {impactData.years_scope === 2 && (
              <p className="mt-1 text-xs text-blue-600">ייווצר עבור השנה הנוכחית והשנה הבאה</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
