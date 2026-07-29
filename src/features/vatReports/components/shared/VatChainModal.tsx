import { useQuery } from '@tanstack/react-query'
import { Modal } from '@/components/ui/overlays/Modal'
import { Badge } from '@/components/ui/primitives/Badge'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { InlineState } from '@/components/ui/feedback/InlineState'
import { formatDateTime } from '@/utils/utils'
import { vatReportsApi } from '../../api'
import { vatReportsQK } from '../../api/queryKeys'
import { VAT_MESSAGES } from '../../messages'

interface VatChainModalProps {
  open: boolean
  workItemId: number
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
export const VatChainModal: React.FC<VatChainModalProps> = ({ open, workItemId, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: vatReportsQK.chain(workItemId),
    queryFn: () => vatReportsApi.listChain(workItemId),
    enabled: open,
  })

  return (
    <Modal open={open} onClose={onClose} title={VAT_MESSAGES.chain.title}>
      {isLoading ? (
        <Spinner />
      ) : !data?.length ? (
        <InlineState title={VAT_MESSAGES.chain.empty} />
      ) : (
        <ol className="space-y-2">
          {data.map((record) => (
            <li key={record.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-100 px-3 py-2">
              <Badge variant={record.amends_id == null ? 'neutral' : 'warning'}>
                {record.amends_id == null ? VAT_MESSAGES.chain.original : VAT_MESSAGES.chain.amendment}
              </Badge>
              <span className="text-sm text-gray-700">
                {record.closed_at ? VAT_MESSAGES.chain.closedAt(formatDateTime(record.closed_at)) : VAT_MESSAGES.chain.open}
              </span>
              {/* The tip is the record every other screen shows. Naming it here
                  is what stops the list reading as several live periods. */}
              {record.superseded_at == null && <Badge variant="positive">{VAT_MESSAGES.chain.current}</Badge>}
            </li>
          ))}
        </ol>
      )}
    </Modal>
  )
}

VatChainModal.displayName = 'VatChainModal'
