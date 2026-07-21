import { CheckCircle2 } from 'lucide-react'
import { formatDateTime } from '@/utils/utils'
import { VAT_FILING_METHOD_LABELS } from '../../constants/vatConstants'
import type { VatFiledBannerProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

export const VatFiledBanner: React.FC<VatFiledBannerProps> = ({
  filedAt,
  filedByName,
  filedBy,
  filingMethod,
  submissionReference,
  isAmendment,
  amendsItemId,
}) => {
  const methodLabel = filingMethod ? VAT_FILING_METHOD_LABELS[filingMethod] : null
  const byLabel = filedByName ?? (filedBy != null ? `#${filedBy}` : null)

  return (
    <div className="flex items-center gap-3 rounded-xl border border-positive-200 bg-positive-50 px-5 py-3">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-positive-600" />
      <p className="text-sm font-medium text-positive-800">
        {VAT_MESSAGES.filedBanner.filedAt(formatDateTime(filedAt))}
        {byLabel && <span className="font-normal text-positive-700">{VAT_MESSAGES.filedBanner.by(byLabel)}</span>}
        {methodLabel && <span className="font-normal text-positive-600"> · {methodLabel}</span>}
        {submissionReference && (
          <span className="font-normal text-positive-600">{VAT_MESSAGES.filedBanner.reference(submissionReference)}</span>
        )}
        {isAmendment && amendsItemId && (
          <span className="font-normal text-positive-600">{VAT_MESSAGES.filedBanner.amendment(amendsItemId)}</span>
        )}
      </p>
    </div>
  )
}

VatFiledBanner.displayName = 'VatFiledBanner'
