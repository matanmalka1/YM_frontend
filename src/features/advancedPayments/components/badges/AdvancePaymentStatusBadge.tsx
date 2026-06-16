import { Badge } from '../../../../components/ui/primitives/Badge'
import { getAdvancePaymentStatusLabel, getAdvancePaymentStatusVariant } from '../../constants'
import type { AdvancePaymentStatus } from '../../api/contracts'

interface AdvancePaymentStatusBadgeProps {
  status: AdvancePaymentStatus
}

export const AdvancePaymentStatusBadge: React.FC<AdvancePaymentStatusBadgeProps> = ({ status }) => (
  <Badge variant={getAdvancePaymentStatusVariant(status)}>{getAdvancePaymentStatusLabel(status)}</Badge>
)

AdvancePaymentStatusBadge.displayName = 'AdvancePaymentStatusBadge'
