import { CreditCard, ExternalLink, FileText } from 'lucide-react'
import { IconLabel } from '../../../components/ui/primitives/IconLabel'
import { Button } from '../../../components/ui/primitives/Button'
import type { TimelineEventMetadata } from '../api'
import type { NormalizedTimelineEvent } from '../normalize'
import type { ActionCommand } from '@/lib/actions/types'
import { cn } from '../../../utils/utils'
import { staggerDelay } from '../../../utils/animation'
import { getEventColor } from '../constants'
import { getAnnualReportStatusLabel, getTimelineStatusLabel } from '../labels'
import { formatTimelineDate, formatTimestamp, getEventIcon } from '../utils'

// ── Metadata sub-components ───────────────────────────────────────────────────

interface MetaRowProps {
  className?: string
  children: React.ReactNode
}
const MetaRow: React.FC<MetaRowProps> = ({ className, children }) => (
  <div className={cn('text-xs text-gray-600 rounded px-3 py-2 border', className)}>{children}</div>
)

const MetaField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="font-medium">{label}:</span> {value}
  </div>
)

// ── Status transition ─────────────────────────────────────────────────────────

const StatusTransition: React.FC<{ oldStatus: string; newStatus: string }> = ({ oldStatus, newStatus }) => (
  <MetaRow className="bg-info-50 border-info-100 flex items-center gap-2">
    <span className="px-2 py-0.5 rounded bg-info-100 text-info-700 font-medium text-[11px]">
      {getTimelineStatusLabel(oldStatus)}
    </span>
    <span className="text-info-400">←</span>
    <span className="px-2 py-0.5 rounded bg-positive-100 text-positive-700 font-medium text-[11px]">
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
    old_status,
    new_status,
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
      {eventType !== 'binder_status_change' && old_status && new_status && (
        <StatusTransition oldStatus={old_status} newStatus={new_status} />
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
    <div className="flex flex-wrap gap-2">
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
  onAction?: (action: ActionCommand) => void
  activeActionKey?: string | null
}

export const TimelineEventItem: React.FC<TimelineEventItemProps> = ({
  timelineEvent: ev,
  index,
  onAction,
  activeActionKey,
}) => {
  const colors = getEventColor(ev.event_type)
  const displayDate = ev.isDateOnly ? formatTimelineDate(ev.displayTimestamp) : formatTimestamp(ev.displayTimestamp)
  const primaryAction = ev.actionsList[0]
  const isQuiet = ev.importance === 'quiet'

  return (
    <li className="relative flex gap-4 animate-fade-in" style={{ animationDelay: staggerDelay(index) }}>
      {/* Timeline dot */}
      <div className="relative z-10 flex-shrink-0 mt-3.5">
        <div className={cn('h-[10px] w-[10px] rounded-full border-2 bg-white shadow-sm', colors.dotBorder)}>
          <div className={cn('absolute inset-0 m-auto h-[4px] w-[4px] rounded-full', colors.dotBg)} />
        </div>
      </div>

      {/* Event card */}
      <div
        className={cn(
          'flex-1 mb-2 rounded-lg border border-gray-100 bg-white/95 overflow-hidden',
          'border-r-2',
          colors.cardBorder,
          'transition-all duration-200 hover:shadow-md hover:border-gray-200',
          isQuiet && 'bg-gray-50/70 border-gray-100',
        )}
      >
        {/* Top tint bar */}
        <div className={cn('h-1 w-full bg-gradient-to-l', colors.cardTint, 'to-transparent')} />

        <div className="px-4 py-3 space-y-3">
          {/* Header: title + timestamp */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                  isQuiet ? 'bg-gray-100 text-gray-600' : cn(colors.badgeBg, colors.badgeText),
                )}
              >
                <span className={isQuiet ? 'text-gray-500' : colors.iconColor}>{getEventIcon(ev.event_type)}</span>
                {ev.title}
              </span>
            </div>

            <time dateTime={ev.displayTimestamp} className="text-xs text-gray-400 font-mono tabular-nums flex-shrink-0">
              {displayDate}
            </time>
          </div>

          {/* Description */}
          {ev.secondary && (
            <p className={cn('text-sm leading-relaxed', isQuiet ? 'text-gray-500' : 'text-gray-700')}>{ev.secondary}</p>
          )}

          {/* Related IDs */}
          <RelatedIds binderId={ev.binder_id} chargeId={ev.charge_id} relatedEntity={ev.relatedEntity} />

          {/* Metadata */}
          {ev.metadata && <EventMetadata metadata={ev.metadata} eventType={ev.event_type} />}

          {primaryAction && onAction && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAction(primaryAction)}
                isLoading={activeActionKey === primaryAction.uiKey}
                className="gap-1.5 text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                פתח
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

TimelineEventItem.displayName = 'TimelineEventItem'
