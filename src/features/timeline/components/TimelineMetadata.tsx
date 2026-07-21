import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/primitives/Badge'
import { MonoValue } from '@/components/ui/primitives/MonoValue'
import { DefinitionList, type DefinitionItem } from '@/components/ui/layout/DefinitionList'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { formatCurrencyILS } from '@/utils/utils'
import type { TimelineEventMetadata } from '../api'
import { getAnnualReportStatusLabel, getTimelineStatusLabel } from '../labels'
import { TIMELINE_MESSAGES } from '../messages'

const SIGNATURE_EVENT_TYPES = new Set([
  'signature_request_sent',
  'signature_request_signed',
  'signature_request_declined',
  'signature_request_canceled',
  'signature_request_expired',
])

const StatusTransition: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <span className="inline-flex flex-wrap items-center gap-1">
    <Badge size="2xs" variant="neutral">
      {from}
    </Badge>
    <ArrowLeft className="h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
    <Badge size="2xs" variant="positive">
      {to}
    </Badge>
  </span>
)

interface TimelineMetadataProps {
  metadata: TimelineEventMetadata
  eventType: string
}

export const TimelineMetadata: React.FC<TimelineMetadataProps> = ({ metadata, eventType }) => {
  const {
    old_value,
    new_value,
    amount,
    provider,
    external_invoice_id,
    tax_year,
    form_type,
    from_status,
    to_status,
    note,
    signer_name,
    reason,
    notes,
  } = metadata

  const labels = TIMELINE_MESSAGES.eventItem
  const items: DefinitionItem[] = []

  if (eventType !== 'binder_lifecycle_change' && old_value != null && new_value != null) {
    items.push({
      label: labels.statusTransitionLabel,
      value: <StatusTransition from={getTimelineStatusLabel(String(old_value))} to={getTimelineStatusLabel(String(new_value))} />,
    })
  }

  if (amount != null) {
    items.push({
      label: labels.amountLabel,
      value: <MonoValue value={formatCurrencyILS(Number(amount), { fractionDigits: 2 })} tone="positive" className="text-xs" />,
    })
  }

  if (external_invoice_id != null) {
    items.push({ label: labels.providerLabel, value: String(provider ?? labels.unknownProvider) })
    items.push({
      label: labels.invoiceIdLabel,
      // bdi isolates the LTR id from the surrounding RTL metadata strip.
      value: (
        <bdi>
          <MonoValue value={String(external_invoice_id)} className="text-xs" />
        </bdi>
      ),
    })
  }

  if (eventType === 'annual_report_status_changed') {
    if (tax_year != null) items.push({ label: labels.taxYearLabel, value: String(tax_year) })
    if (form_type) items.push({ label: labels.formLabel, value: form_type })
    if (from_status && to_status) {
      items.push({
        label: labels.statusTransitionLabel,
        value: <StatusTransition from={getAnnualReportStatusLabel(from_status)} to={getAnnualReportStatusLabel(to_status)} />,
      })
    }
    if (note) items.push({ label: labels.noteLabel, value: note, fullWidth: true })
  }

  if (SIGNATURE_EVENT_TYPES.has(eventType)) {
    if (signer_name) items.push({ label: labels.signerLabel, value: signer_name })
    if (reason) {
      items.push({
        label: labels.rejectionReasonLabel,
        value: <span className="text-negative-700">{reason}</span>,
        fullWidth: true,
      })
    }
    if (notes) items.push({ label: GLOBAL_UI_MESSAGES.common.notes, value: notes, fullWidth: true })
  }

  if (items.length === 0) return null

  return <DefinitionList layout="inline" items={items} className="border-t border-gray-100 pt-2" />
}

TimelineMetadata.displayName = 'TimelineMetadata'
