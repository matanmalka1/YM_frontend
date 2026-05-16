import { Badge } from '../../../components/ui/primitives/Badge'
import { getAdvancePaymentStatusLabel } from '../../../utils/enums'
import type { AdvancePaymentStatus } from '../types'
import { ADVANCE_PAYMENT_STATUS_VARIANTS as STATUS_VARIANT } from '../../../utils/enums'

interface AdvancePaymentStatusBadgeProps {
  status: AdvancePaymentStatus
}

export const AdvancePaymentStatusBadge: React.FC<AdvancePaymentStatusBadgeProps> = ({ status }) => (
  <Badge variant={STATUS_VARIANT[status] ?? 'neutral'}>{getAdvancePaymentStatusLabel(status)}</Badge>
)

AdvancePaymentStatusBadge.displayName = 'AdvancePaymentStatusBadge'
