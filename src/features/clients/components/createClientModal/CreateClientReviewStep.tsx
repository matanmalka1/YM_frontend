import type { ClientCreationImpactResponse } from '../../api/contracts'
import type { CreateClientFormValues } from '../../schemas'
import { formatDate } from '@/utils/utils'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { Badge } from '@/components/ui/primitives/Badge'
import { getCreateClientEntityLabels } from '../../constants'
import { buildCreateClientReviewModel } from '../../utils/createClientFormUtils'
import { ImpactIcon } from './createClientImpactIcons'
import { CLIENTS_MESSAGES } from '../../messages'
import { CLIENTS_ERROR_MESSAGES } from '../../errorMessages'

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
  const {
    isCompany,
    isExempt,
    entityLabel,
    vatLabel,
    advanceLabel,
    advisorLabel,
    businessDisplayName,
    addressLine,
    impactTotal,
  } = buildCreateClientReviewModel(values, advisorOptions, impactData)
  const entityLabels = getCreateClientEntityLabels(isCompany)

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">{CLIENTS_MESSAGES.createReview.intro}</p>

      <ReviewSection title={CLIENTS_MESSAGES.createReview.sectionIdentity}>
        <ReviewRow label={CLIENTS_MESSAGES.createReview.entityType} value={entityLabel} />
        <ReviewRow label={entityLabels.name} value={values.full_name} />
        <ReviewRow label={entityLabels.idNumber} value={values.id_number} />
      </ReviewSection>

      <ReviewSection title={entityLabels.contactSection}>
        <ReviewRow label={entityLabels.businessName} value={businessDisplayName} />
        <ReviewRow label={entityLabels.businessOpenedAt} value={formatDate(values.business_opened_at ?? null)} />
        <ReviewRow label={CLIENTS_MESSAGES.createReview.phone} value={values.phone} />
        <ReviewRow label={CLIENTS_MESSAGES.createReview.email} value={values.email} />
        <ReviewRow label={CLIENTS_MESSAGES.createReview.address} value={addressLine} />
      </ReviewSection>

      <ReviewSection title={CLIENTS_MESSAGES.createReview.sectionTax}>
        {!isExempt && <ReviewRow label={CLIENTS_MESSAGES.createReview.vatFrequency} value={vatLabel} />}
        <ReviewRow label={CLIENTS_MESSAGES.createReview.advanceFrequency} value={advanceLabel} />
        <ReviewRow
          label={CLIENTS_MESSAGES.createReview.advanceRate}
          value={values.advance_rate ? CLIENTS_MESSAGES.shared.advanceRatePercent(values.advance_rate) : null}
        />
        <ReviewRow label={CLIENTS_MESSAGES.createReview.accountant} value={advisorLabel} />
      </ReviewSection>

      <div className="rounded-lg border border-primary-200 bg-primary-50/70 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-primary-900">{CLIENTS_MESSAGES.createReview.impactTitle}</p>
            <p className="mt-0.5 text-xs text-primary-700">{CLIENTS_MESSAGES.createReview.impactSubtitle}</p>
          </div>
          {impactData && (
            <Badge variant="info" size="xs">
              {CLIENTS_MESSAGES.createReview.impactItemsCount(impactTotal)}
            </Badge>
          )}
        </div>
        {impactLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} height="h-4" width="w-full" className="bg-primary-100" />
            ))}
          </div>
        ) : impactError ? (
          <p className="text-sm text-primary-700">{CLIENTS_ERROR_MESSAGES.create.impact}</p>
        ) : impactData ? (
          <>
            <ul className="grid gap-2 sm:grid-cols-2">
              {impactData.items.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center gap-3 rounded-md bg-white px-3 py-2.5 text-primary-900 shadow-sm ring-1 ring-primary-100"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-100 text-primary-700">
                    <ImpactIcon label={item.label} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold leading-5 text-primary-950">{item.count}</span>
                    <span className="block truncate text-xs font-medium text-primary-700">{item.label}</span>
                  </span>
                </li>
              ))}
            </ul>
            {impactData.note && <p className="mt-2 text-xs text-primary-600">{impactData.note}</p>}
            {impactData.years_scope === 2 && (
              <p className="mt-1 text-xs text-primary-600">{CLIENTS_MESSAGES.createReview.impactTwoYearScope}</p>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
