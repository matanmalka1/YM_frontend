import { CheckCircle2 } from 'lucide-react'
import { formatDateTime } from '@/utils/utils'
import { VAT_FILING_METHOD_LABELS } from '../constants'
import type { VatFiledBannerProps } from '../types'

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
    <div className="flex items-center gap-3 rounded-xl border border-positive-200 bg-positive-50 px-5 py-3" dir="rtl">
      <CheckCircle2 className="h-5 w-5 shrink-0 text-positive-600" />
      <p className="text-sm font-medium text-positive-800">
        הדוח הוגש ב‑{formatDateTime(filedAt)}
        {byLabel && <span className="font-normal text-positive-700"> על ידי {byLabel}</span>}
        {methodLabel && <span className="font-normal text-positive-600"> · {methodLabel}</span>}
        {submissionReference && <span className="font-normal text-positive-600"> · אסמכתא: {submissionReference}</span>}
        {isAmendment && amendsItemId && (
          <span className="font-normal text-positive-600"> · תיקון לפריט #{amendsItemId}</span>
        )}
      </p>
    </div>
  )
}

VatFiledBanner.displayName = 'VatFiledBanner'
