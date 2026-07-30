import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import { Modal } from '@/components/ui/overlays/Modal'
import { ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { Badge } from '@/components/ui/primitives/Badge'
import { Spinner } from '@/components/ui/primitives/Spinner'
import { InlineState } from '@/components/ui/feedback/InlineState'
import { cn, formatDateTime } from '@/utils/utils'
import { toSiblingRecordPath } from '@/utils/recordPath'
import { vatReportsApi } from '../../api'
import { vatReportsQK } from '../../api/queryKeys'
import { VAT_MESSAGES } from '../../messages'

const ROW_CLASS = 'flex w-full flex-wrap items-center justify-start gap-2 rounded-lg border border-gray-100 px-3 py-2'

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
 *
 * Links to the record it names, which is what makes "readable" true — a
 * superseded record is fetchable by id precisely so a corrected period's
 * history can be opened. Two rows are deliberately not links: the record
 * already on screen, and a **withdrawn** correction, which is soft-deleted and
 * whose detail read answers 404.
 */
export const VatChainModal: React.FC<VatChainModalProps> = ({ open, workItemId, onClose }) => {
  const { pathname } = useLocation()
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
          {data.map((record) => {
            const content = (
              <>
                <Badge variant={record.amends_id == null ? 'neutral' : 'warning'}>
                  {record.amends_id == null ? VAT_MESSAGES.chain.original : VAT_MESSAGES.chain.amendment}
                </Badge>
                <span className="text-sm text-gray-700">
                  {record.closed_at ? VAT_MESSAGES.chain.closedAt(formatDateTime(record.closed_at)) : VAT_MESSAGES.chain.open}
                </span>
                {/* The tip is the record every other screen shows. Naming it here
                    is what stops the list reading as several live records. A withdrawn
                    correction also has no `superseded_at` — nothing replaced it — so it
                    has to be excluded here or it would read as the live one. */}
                {record.is_withdrawn && <Badge variant="neutral">{VAT_MESSAGES.chain.withdrawn}</Badge>}
                {!record.is_withdrawn && record.superseded_at == null && (
                  <Badge variant="positive">{VAT_MESSAGES.chain.current}</Badge>
                )}
              </>
            )
            return (
              <li key={record.id}>
                {record.is_withdrawn || record.id === workItemId ? (
                  <div className={ROW_CLASS}>{content}</div>
                ) : (
                  <ActionSurfaceLink
                    variant="plainRow"
                    to={toSiblingRecordPath(pathname, record.id)}
                    onClick={onClose}
                    className={cn(ROW_CLASS, 'hover:border-gray-200')}
                  >
                    {content}
                  </ActionSurfaceLink>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </Modal>
  )
}

VatChainModal.displayName = 'VatChainModal'
