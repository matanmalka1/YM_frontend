import { DollarSign } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatDate } from '@/utils/utils'
import type { AttentionItem } from './api'
import type { ActionCommand } from '@/lib/actions/types'

export type AttentionTone = 'amber' | 'green' | 'red' | 'blue'

export interface PanelItemAction {
  uiKey: string
  label: string
  urgency?: 'overdue' | 'upcoming' | null
  dueLabel?: string | null
  action: ActionCommand
}

export interface PanelItem {
  id: string | number
  label: string
  sublabel?: string
  href: string
  meta?: {
    tag?: string
    badge?: string
    badgeTone?: AttentionTone
    description?: string
    amount?: string
  }
  actions?: PanelItemAction[]
}

export interface PanelSection {
  key: string
  title: string
  icon: LucideIcon
  tone: AttentionTone
  items: PanelItem[]
}

const OPEN_CHARGES_HREF = '/charges?status=issued'

const getChargeAttentionHref = (item: AttentionItem): string => {
  return item.charge_id ? `/charges?charge_id=${item.charge_id}` : OPEN_CHARGES_HREF
}

const getChargeItemDescription = (item: AttentionItem): string | undefined => {
  const parts = [item.charge_subject, item.charge_date ? `תאריך חיוב ${formatDate(item.charge_date)}` : null]
  return parts.filter(Boolean).join(' · ') || undefined
}

const getChargeAmount = (item: AttentionItem): string | undefined => {
  return item.charge_amount ?? undefined
}

export const buildOpenChargeSection = (items: AttentionItem[]): PanelSection => ({
  key: 'open_charges',
  title: 'חשבוניות פתוחות',
  icon: DollarSign,
  tone: 'amber',
  items: items.map((item) => ({
    id: `${item.item_type}-${item.charge_id}`,
    label: item.client_name ?? '',
    sublabel: item.description,
    href: getChargeAttentionHref(item),
    meta: {
      description: getChargeItemDescription(item),
      amount: getChargeAmount(item),
    },
  })),
})
