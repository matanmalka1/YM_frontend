import { useQuery } from '@tanstack/react-query'
import { Modal } from '@/components/ui/overlays/Modal'
import { Badge } from '@/components/ui/primitives/Badge'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { InlineState } from '@/components/ui/feedback/InlineState'
import { formatDateTime } from '@/utils/utils'
import { advancePaymentsApi } from '../../api'
import { advancedPaymentsQK } from '../../api/queryKeys'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'

interface AdvancePaymentChainModalProps {
  open: boolean
  clientRecordId: number
  paymentId: number
  onClose: () => void
}

/**
 * The correction history of one period, oldest first.
 *
 * Every other list in the app shows an amendment chain as a single row (D-12).
 * This is the one place the superseded records are the point: a closed record
 * stays closed forever, and this is where what it originally said remains
 * readable.
 */
export const AdvancePaymentChainModal: React.FC<AdvancePaymentChainModalProps> = ({
  open,
  clientRecordId,
  paymentId,
  onClose,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: advancedPaymentsQK.chain(clientRecordId, paymentId),
    queryFn: () => advancePaymentsApi.listChain(clientRecordId, paymentId),
    enabled: open,
  })

  return (
    <Modal open={open} onClose={onClose} title={ADVANCED_PAYMENTS_MESSAGES.chain.title}>
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <InlineState title={ADVANCED_PAYMENTS_MESSAGES.chain.empty} />
      ) : (
        <ol className="space-y-2">
          {data.map((record) => (
            <li key={record.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
              <Badge variant={record.amends_id == null ? 'neutral' : 'warning'}>
                {record.amends_id == null
                  ? ADVANCED_PAYMENTS_MESSAGES.chain.original
                  : ADVANCED_PAYMENTS_MESSAGES.chain.amendment}
              </Badge>
              <span className="text-sm text-gray-700">
                {record.closed_at
                  ? ADVANCED_PAYMENTS_MESSAGES.chain.closedAt(formatDateTime(record.closed_at))
                  : ADVANCED_PAYMENTS_MESSAGES.chain.open}
              </span>
              {/* The tip is the record every other screen shows. Naming it here
                  is what stops the list reading as several live records. A withdrawn
                  correction also has no `superseded_at` — nothing replaced it — so it
                  has to be excluded here or it would read as the live one. */}
              {record.is_withdrawn && <Badge variant="neutral">{ADVANCED_PAYMENTS_MESSAGES.chain.withdrawn}</Badge>}
              {!record.is_withdrawn && record.superseded_at == null && (
                <Badge variant="positive">{ADVANCED_PAYMENTS_MESSAGES.chain.current}</Badge>
              )}
            </li>
          ))}
        </ol>
      )}
    </Modal>
  )
}

AdvancePaymentChainModal.displayName = 'AdvancePaymentChainModal'
