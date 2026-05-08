import type { EventColorConfig } from './types'

// ── Color palette factory ─────────────────────────────────────────────────────
// Instead of copy-pasting 10 fields × 14 event types, we derive every config
// from a single color token per event type.

type TailwindColor =
  | 'primary'
  | 'emerald'
  | 'sky'
  | 'violet'
  | 'amber'
  | 'orange'
  | 'green'
  | 'rose'
  | 'teal'
  | 'indigo'
  | 'slate'
  | 'gray'

const makeColor = (color: TailwindColor): EventColorConfig => {
  if (color === 'gray') {
    return {
      dotBg: 'bg-gray-400',
      dotBorder: 'border-gray-300',
      cardBorder: 'border-r-gray-300',
      cardTint: 'from-gray-50/40',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-600',
      chipActiveBg: 'bg-gray-100',
      chipActiveText: 'text-gray-700',
      chipActiveBorder: 'border-gray-300',
      iconColor: 'text-gray-500',
    }
  }

  return {
    dotBg: `bg-${color}-500`,
    dotBorder: `border-${color}-300`,
    cardBorder: `border-r-${color}-400`,
    cardTint: `from-${color}-50/60`,
    badgeBg: `bg-${color}-100`,
    badgeText: `text-${color}-700`,
    chipActiveBg: `bg-${color}-100`,
    chipActiveText: `text-${color}-800`,
    chipActiveBorder: `border-${color}-300`,
    iconColor: `text-${color}-600`,
  }
}

// ── Event color map ───────────────────────────────────────────────────────────

const EVENT_COLOR_MAP: Record<string, TailwindColor> = {
  binder_received: 'primary',
  binder_returned: 'emerald',
  binder_status_change: 'sky',
  invoice_created: 'violet',
  invoice_attached: 'violet',
  charge_created: 'amber',
  charge_issued: 'orange',
  charge_paid: 'green',
  notification: 'rose',
  annual_report_status_changed: 'indigo',
  client_created: 'primary',
  tax_profile_updated: 'slate',
  document_uploaded: 'emerald',
  signature_request_sent: 'violet',
  signature_request_signed: 'emerald',
  signature_request_declined: 'rose',
  signature_request_canceled: 'slate',
  signature_request_expired: 'amber',
}

const DEFAULT_EVENT_COLOR: EventColorConfig = makeColor('gray')

// Lazily computed cache so we build each config only once
const colorCache = new Map<string, EventColorConfig>()

export const getEventColor = (eventType: string): EventColorConfig => {
  if (colorCache.has(eventType)) return colorCache.get(eventType)!

  const token = EVENT_COLOR_MAP[eventType]
  const config = token ? makeColor(token) : DEFAULT_EVENT_COLOR
  colorCache.set(eventType, config)
  return config
}
