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

// ── Unified event color ───────────────────────────────────────────────────────
// Every event type shares one accent so the rail reads as a single calm feed;
// quiet vs strong importance is the only per-event visual variance.

const UNIFIED_EVENT_COLOR: EventColorConfig = makeColor('primary')

export const getEventColor = (): EventColorConfig => UNIFIED_EVENT_COLOR
