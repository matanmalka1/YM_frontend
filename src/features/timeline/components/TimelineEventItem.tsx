import { CreditCard, FileText } from 'lucide-react'
import { IconLabel } from '../../../components/ui/primitives/IconLabel'
import type { TimelineEventMetadata } from '../api'
import type { NormalizedTimelineEvent } from '../normalize'
import { cn } from '../../../utils/utils'
import { getEventColor } from '../constants'
import { getAnnualReportStatusLabel, getTimelineStatusLabel } from '../labels'
import { formatTimelineDate, formatTimestamp, getEventIcon } from '../utils'

// ── Metadata sub-components ───────────────────────────────────────────────────

interface MetaRowProps {
  className?: string
  children: React.ReactNode
}
const MetaRow: React.FC<MetaRowProps> = ({ className, children }) => (
  <div className={cn('text-xs text-gray-600 rounded px-2 py-1 border', className)}>{children}</div>
)

const MetaField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="font-medium">{label}:</span> {value}
  </div>
)

// ── Status transition ─────────────────────────────────────────────────────────

const StatusTransition: React.FC<{ oldStatus: string; newStatus: string }> = ({ oldStatus, newStatus }) => (
  <MetaRow className="bg-info-50 border-info-100 flex items-center gap-2">
    <span className="px-1.5 py-0.5 rounded bg-info-100 text-info-700 font-medium text-[10px]">
      {getTimelineStatusLabel(oldStatus)}
    </span>
    <span className="text-info-400">←</span>
    <span className="px-1.5 py-0.5 rounded bg-positive-100 text-positive-700 font-medium text-[10px]">
      {getTimelineStatusLabel(newStatus)}
    </span>
  </MetaRow>
)

// ── Metadata panel ────────────────────────────────────────────────────────────

const SIGNATURE_EVENT_TYPES = new Set([
  'signature_request_sent',
  'signature_request_signed',
  'signature_request_declined',
  'signature_request_canceled',
  'signature_request_expired',
])

const EventMetadata: React.FC<{ metadata: TimelineEventMetadata; eventType: string }> = ({ metadata, eventType }) => {
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

  return (
    <>
      {eventType !== 'binder_lifecycle_change' && old_value && new_value && (
        <StatusTransition oldStatus={String(old_value)} newStatus={String(new_value)} />
      )}

      {amount != null && (
        <MetaRow className="bg-emerald-50 border-emerald-100">
          <MetaField label="סכום" value={`₪${Number(amount).toFixed(2)}`} />
        </MetaRow>
      )}

      {external_invoice_id != null && (
        <MetaRow className="bg-orange-50 border-orange-100">
          <MetaField label="ספק" value={String(provider ?? 'לא ידוע')} />
          <MetaField label="ID חשבונית" value={String(external_invoice_id)} />
        </MetaRow>
      )}

      {eventType === 'annual_report_status_changed' && (from_status || to_status || tax_year || form_type || note) && (
        <MetaRow className="bg-indigo-50 border-indigo-100">
          {tax_year != null && <MetaField label="שנת מס" value={String(tax_year)} />}
          {form_type && <MetaField label="טופס" value={form_type} />}
          {from_status && to_status && (
            <MetaField
              label="מעבר סטטוס"
              value={`${getAnnualReportStatusLabel(from_status)} ← ${getAnnualReportStatusLabel(to_status)}`}
            />
          )}
          {note && <MetaField label="הערה" value={note} />}
        </MetaRow>
      )}

      {SIGNATURE_EVENT_TYPES.has(eventType) && (signer_name || reason || notes) && (
        <MetaRow className="bg-violet-50 border-violet-100">
          {signer_name && <MetaField label="חותם" value={signer_name} />}
          {reason && <MetaField label="סיבת דחייה" value={reason} />}
          {notes && <MetaField label="הערות" value={notes} />}
        </MetaRow>
      )}
    </>
  )
}

// ── Related IDs ───────────────────────────────────────────────────────────────

const RelatedIds: React.FC<{
  binderId: number | null
  chargeId: number | null
  relatedEntity: string | null
}> = ({ binderId, chargeId, relatedEntity }) => {
  if (!binderId && !chargeId && !relatedEntity) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {binderId != null && (
        <IconLabel
          icon={<FileText className="h-3 w-3" />}
          label={`קלסר #${binderId}`}
          className="bg-slate-50 text-slate-600 border-slate-200"
        />
      )}
      {chargeId != null && (
        <IconLabel
          icon={<CreditCard className="h-3 w-3" />}
          label={`חיוב #${chargeId}`}
          className="bg-amber-50 text-amber-700 border-amber-200"
        />
      )}
      {binderId == null && chargeId == null && relatedEntity && (
        <IconLabel
          icon={<FileText className="h-3 w-3" />}
          label={relatedEntity}
          className="bg-slate-50 text-slate-600 border-slate-200"
        />
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface TimelineEventItemProps {
  timelineEvent: NormalizedTimelineEvent
  index: number
}

export const TimelineEventItem: React.FC<TimelineEventItemProps> = ({ timelineEvent: ev }) => {
  const colors = getEventColor(ev.event_type)
  const displayDate = ev.isDateOnly ? formatTimelineDate(ev.displayTimestamp) : formatTimestamp(ev.displayTimestamp)
  const isQuiet = ev.importance === 'quiet'

  return (
    <li className="animate-fade-in">
      <div
        className={cn(
          'rounded-md border border-gray-100 bg-white/95 overflow-hidden',
          'border-r-2',
          colors.cardBorder,
          'transition-colors duration-150 hover:border-gray-200 hover:shadow-sm',
          isQuiet && 'bg-gray-50/60',
        )}
      >
        <div className="px-3 py-2 space-y-1.5">
          {/* Header: type badge + timestamp */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                isQuiet ? 'bg-gray-100 text-gray-600' : cn(colors.badgeBg, colors.badgeText),
              )}
            >
              <span className={isQuiet ? 'text-gray-500' : colors.iconColor}>{getEventIcon(ev.event_type)}</span>
              {ev.title}
            </span>

            <time
              dateTime={ev.displayTimestamp}
              className="text-[11px] text-gray-400 font-mono tabular-nums flex-shrink-0"
            >
              {displayDate}
            </time>
          </div>

          {ev.secondary && (
            <p className={cn('text-xs leading-snug', isQuiet ? 'text-gray-400' : 'text-gray-600')}>{ev.secondary}</p>
          )}

          <RelatedIds binderId={ev.binder_id} chargeId={ev.charge_id} relatedEntity={ev.relatedEntity} />

          {ev.metadata && <EventMetadata metadata={ev.metadata} eventType={ev.event_type} />}
        </div>
      </div>
    </li>
  )
}

TimelineEventItem.displayName = 'TimelineEventItem'
