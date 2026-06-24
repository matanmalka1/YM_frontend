import { ProgressBar } from '@/components/ui/primitives/ProgressBar'
import { Badge } from '@/components/ui/primitives/Badge'
import { VAT_WORKFLOW_STEPS } from '../../constants/vatConstants'
import type { VatProgressBarProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'

export const VatProgressBar: React.FC<VatProgressBarProps> = ({ currentStatus }) => {
  const currentIdx = VAT_WORKFLOW_STEPS.indexOf(currentStatus as (typeof VAT_WORKFLOW_STEPS)[number])
  const step = currentIdx >= 0 ? currentIdx + 1 : 1
  const total = VAT_WORKFLOW_STEPS.length
  const percent = Math.round((step / total) * 100)
  const isFiled = currentStatus === 'filed'

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
      <Badge variant="neutral" size="xs" className="shrink-0 tabular-nums shadow-sm ring-1 ring-gray-200">
        {VAT_MESSAGES.progress.step(step, total)}
      </Badge>
      <ProgressBar
        value={percent}
        className="flex-1"
        trackClassName="bg-gray-200"
        fillClassName={isFiled ? 'bg-positive-500' : 'bg-primary-500'}
      />
      <span className="shrink-0 text-xs font-medium text-gray-500 tabular-nums" dir="ltr">
        {percent}%
      </span>
    </div>
  )
}

VatProgressBar.displayName = 'VatProgressBar'
