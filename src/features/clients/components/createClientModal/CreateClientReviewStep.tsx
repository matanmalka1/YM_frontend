import type { ClientCreationImpactResponse } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import {
  ADVANCE_PAYMENT_FREQUENCY_LABELS,
  ENTITY_TYPE_LABELS,
  VAT_TYPE_LABELS,
} from '../../constants'

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

  const vatLabel =
    isExempt
      ? 'פטור'
      : values.vat_reporting_frequency
        ? VAT_TYPE_LABELS[values.vat_reporting_frequency]
        : null

  const advanceLabel = values.advance_payment_frequency
    ? ADVANCE_PAYMENT_FREQUENCY_LABELS[values.advance_payment_frequency]
    : null

  const advisorLabel = advisorOptions.find((o) => o.value === values.accountant_id)?.label

  const businessDisplayName =
    values.business_name?.trim() ||
    (isCompany ? null : values.full_name?.trim())

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

      <ReviewSection title="עסק ופרטי קשר">
        <ReviewRow label={isCompany ? 'שם מסחרי' : 'שם עסק'} value={businessDisplayName} />
        <ReviewRow
          label={isCompany ? 'תאריך התאגדות' : 'תאריך פתיחת תיק'}
          value={values.business_opened_at ?? null}
        />
        <ReviewRow label="טלפון" value={values.phone} />
        <ReviewRow label="אימייל" value={values.email} />
        <ReviewRow label="כתובת" value={addressParts || null} />
      </ReviewSection>

      <ReviewSection title="מס ומע״מ">
        {!isExempt && <ReviewRow label="תדירות דיווח מע״מ" value={vatLabel} />}
        <ReviewRow label="תדירות מקדמות" value={advanceLabel} />
        <ReviewRow
          label="שיעור מקדמות"
          value={values.advance_rate ? `${values.advance_rate}%` : null}
        />
        <ReviewRow label="רואה חשבון" value={advisorLabel ?? null} />
      </ReviewSection>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4" dir="rtl">
        <p className="mb-2 text-sm font-semibold text-blue-800">מה ייווצר לאחר שמירה?</p>
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
        ) : null}
      </div>
    </div>
  )
}
