import type { EventColorConfig } from './types'

// ── Color palette factory ─────────────────────────────────────────────────────
// Instead of copy-pasting 10 fields × 14 event types, we derive every config
// from a single color token per event type.

type SemanticTone = 'primary' | 'positive' | 'warning' | 'negative' | 'info' | 'slate'

const makeColor = (tone: SemanticTone): EventColorConfig => {
  if (tone === 'slate') {
    return {
      dotBg: 'bg-slate-400',
      dotBorder: 'border-slate-200',
      cardBorder: 'border-r-slate-300',
      cardTint: 'from-slate-50/60',
      badgeBg: 'bg-slate-100',
      badgeText: 'text-slate-600',
      chipActiveBg: 'bg-slate-100',
      chipActiveText: 'text-slate-700',
      chipActiveBorder: 'border-slate-300',
      iconColor: 'text-slate-500',
    }
  }

  return {
    dotBg: `bg-${tone}-500`,
    dotBorder: `border-${tone}-200`,
    cardBorder: `border-r-${tone}-400`,
    cardTint: `from-${tone}-50/60`,
    badgeBg: `bg-${tone}-100`,
    badgeText: `text-${tone}-700`,
    chipActiveBg: `bg-${tone}-100`,
    chipActiveText: `text-${tone}-800`,
    chipActiveBorder: `border-${tone}-300`,
    iconColor: `text-${tone}-600`,
  }
}

// ── Event color map ───────────────────────────────────────────────────────────

const EVENT_COLOR_MAP: Record<string, SemanticTone> = {
  binder_received: 'primary',
  binder_handed_over: 'positive',
  binder_lifecycle_change: 'info',
  invoice_attached: 'info',
  charge_created: 'warning',
  charge_issued: 'warning',
  charge_paid: 'positive',
  annual_report_status_changed: 'primary',
  client_created: 'primary',
  document_uploaded: 'positive',
  signature_request_sent: 'info',
  signature_request_signed: 'positive',
  signature_request_declined: 'negative',
  signature_request_canceled: 'slate',
  signature_request_expired: 'warning',
}

const DEFAULT_EVENT_COLOR: EventColorConfig = makeColor('slate')

// Lazily computed cache so we build each config only once
const colorCache = new Map<string, EventColorConfig>()

export const getEventColor = (eventType: string): EventColorConfig => {
  if (colorCache.has(eventType)) return colorCache.get(eventType)!

  const token = EVENT_COLOR_MAP[eventType]
  const config = token ? makeColor(token) : DEFAULT_EVENT_COLOR
  colorCache.set(eventType, config)
  return config
}
