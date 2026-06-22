import { CreditCard, FileText } from 'lucide-react'
import type { TimelineEventMetadata } from '../api'
import type { NormalizedTimelineEvent } from '../normalize'
import { cn, formatCurrencyILS } from '@/utils/utils'
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

const IconLabel: React.FC<{ icon: React.ReactNode; label: string; className?: string }> = ({
  icon,
  label,
  className,
}) => (
  <span className={cn('inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-2xs', className)}>
    {icon}
    <span>{label}</span>
  </span>
)

// ── Status transition ─────────────────────────────────────────────────────────

const StatusTransition: React.FC<{ oldStatus: string; newStatus: string }> = ({ oldStatus, newStatus }) => (
  <MetaRow className="bg-slate-50 border-slate-100 flex items-center gap-2">
    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-3xs">
      {getTimelineStatusLabel(oldStatus)}
    </span>
    <span className="text-slate-400">←</span>
    <span className="px-1.5 py-0.5 rounded bg-positive-100 text-positive-700 font-medium text-3xs">
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
        <MetaRow className="bg-positive-50 border-positive-100">
          <MetaField label="סכום" value={formatCurrencyILS(Number(amount), { fractionDigits: 2 })} />
        </MetaRow>
      )}

      {external_invoice_id != null && (
        <MetaRow className="bg-warning-50 border-warning-100">
          <MetaField label="ספק" value={String(provider ?? 'לא ידוע')} />
          <MetaField label="ID חשבונית" value={String(external_invoice_id)} />
        </MetaRow>
      )}

      {eventType === 'annual_report_status_changed' && (from_status || to_status || tax_year || form_type || note) && (
        <MetaRow className="bg-primary-50 border-primary-100">
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
        <MetaRow className="bg-info-50 border-info-100">
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
          className="bg-warning-50 text-warning-700 border-warning-200"
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
  isLast: boolean
}

export const TimelineEventItem: React.FC<TimelineEventItemProps> = ({ timelineEvent: ev, isLast }) => {
  const colors = getEventColor(ev.event_type)
  const displayDate = ev.isDateOnly ? formatTimelineDate(ev.displayTimestamp) : formatTimestamp(ev.displayTimestamp)
  const isQuiet = ev.importance === 'quiet'

  return (
    <li className="relative flex gap-3 animate-fade-in">
      {/* Connector rail */}
      <div className="relative flex w-7 flex-shrink-0 flex-col items-center">
        <span
          className={cn(
            'z-10 mt-1 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white',
            isQuiet ? 'border-gray-200 text-gray-400' : cn(colors.dotBorder, colors.iconColor),
          )}
        >
          {getEventIcon(ev.event_type)}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-gray-200" />}
      </div>

      {/* Content */}
      <div
        className={cn(
          'mb-3 flex-1 rounded-xl border border-gray-200/80 bg-white px-3 py-2.5 space-y-1.5',
          'transition-shadow duration-150 hover:shadow-elevation-1',
          isQuiet && 'bg-gray-50/60',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className={cn('text-sm font-semibold', isQuiet ? 'text-gray-500' : 'text-gray-900')}>{ev.title}</span>

          <time dateTime={ev.displayTimestamp} className="text-2xs text-gray-400 tabular-nums flex-shrink-0">
            {displayDate}
          </time>
        </div>

        {ev.secondary && (
          <p className={cn('text-xs leading-snug', isQuiet ? 'text-gray-400' : 'text-gray-600')}>{ev.secondary}</p>
        )}

        <RelatedIds binderId={ev.binder_id} chargeId={ev.charge_id} relatedEntity={ev.relatedEntity} />

        {ev.metadata && <EventMetadata metadata={ev.metadata} eventType={ev.event_type} />}
      </div>
    </li>
  )
}

TimelineEventItem.displayName = 'TimelineEventItem'
