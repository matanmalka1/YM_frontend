import { Bell, DollarSign, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { mapActions } from '@/lib/actions/mapActions'
import { formatDate } from '@/utils/utils'
import type { AttentionItem, AttentionItemType } from './api'
import type { BackendAction, ActionCommand } from '@/lib/actions/types'

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
const OPEN_CHARGE_TYPES: readonly AttentionItemType[] = ['unpaid_charge', 'unpaid_charges']

const getChargeAttentionHref = (item: AttentionItem): string => {
  if (item.item_type === 'unpaid_charge') return `/charges?charge_id=${item.charge_id}`
  if (item.client_id && item.business_id) return `/clients/${item.client_id}/businesses/${item.business_id}`
  if (item.client_id) return `/clients/${item.client_id}`
  return OPEN_CHARGES_HREF
}

const getChargeItemDescription = (item: AttentionItem): string | undefined => {
  if (item.item_type !== 'unpaid_charge') return undefined
  const parts = [item.charge_subject, item.charge_date ? `תאריך חיוב ${formatDate(item.charge_date)}` : null]
  return parts.filter(Boolean).join(' · ') || undefined
}

const getChargeAmount = (item: AttentionItem): string | undefined => {
  if (item.item_type !== 'unpaid_charge') return undefined
  return item.charge_amount ?? undefined
}

export const buildOpenChargeSection = (items: AttentionItem[]): PanelSection => ({
  key: 'open_charges',
  title: 'חשבוניות פתוחות',
  icon: DollarSign,
  tone: 'amber',
  items: items
    .filter((item) => OPEN_CHARGE_TYPES.includes(item.item_type))
    .map((item) => ({
      id: `${item.item_type}-${item.binder_id ?? item.business_id ?? item.client_id}`,
      label: item.client_name ?? '',
      sublabel: item.description,
      href: getChargeAttentionHref(item),
      meta: {
        tag: item.item_type === 'unpaid_charges' ? 'מרובות' : undefined,
        description: getChargeItemDescription(item),
        amount: getChargeAmount(item),
      },
    })),
})

const QA_CATEGORY_LABELS: Record<string, string> = {
  binders: 'קלסרים',
  vat: 'מע"מ',
  annual_reports: 'דו"חות שנתיים',
}

const QA_CATEGORY_ORDER = ['vat', 'annual_reports', 'binders'] as const

const QA_CATEGORY_META: Record<string, { icon: LucideIcon; tone: AttentionTone; href: string }> = {
  vat: { icon: Zap, tone: 'amber', href: '/vat' },
  annual_reports: { icon: Zap, tone: 'red', href: '/tax/reports' },
  binders: { icon: Bell, tone: 'blue', href: '/binders' },
}

const DEFAULT_META = { icon: Zap, tone: 'amber' as AttentionTone, href: '/' }

export const buildQuickActionSections = (rawActions: BackendAction[]): PanelSection[] => {
  const actions = mapActions(rawActions)
  const grouped = new Map<string, PanelItemAction[]>()

  for (const action of actions) {
    const cat = action.category ?? 'general'
    grouped.set(cat, [
      ...(grouped.get(cat) ?? []),
      {
        uiKey: action.uiKey,
        label: action.label,
        urgency: action.urgency,
        dueLabel: action.dueLabel,
        action,
      },
    ])
  }

  const ordered = [...QA_CATEGORY_ORDER, ...[...grouped.keys()].filter((k) => !QA_CATEGORY_ORDER.includes(k as never))]

  return ordered.map((cat) => {
    const catActions = grouped.get(cat) ?? []
    const meta = QA_CATEGORY_META[cat] ?? DEFAULT_META

    return {
      key: cat,
      title: QA_CATEGORY_LABELS[cat] ?? cat,
      icon: meta.icon,
      tone: meta.tone,
      items: catActions.map((a, idx) => ({
        id: `${cat}-${a.uiKey}-${idx}`,
        label: a.action.clientName ?? a.action.binderNumber ?? a.label,
        sublabel: a.dueLabel ?? QA_CATEGORY_LABELS[cat] ?? undefined,
        href: meta.href,
        meta: a.action.description ? { description: a.action.description } : undefined,
        actions: [a],
      })),
    } satisfies PanelSection
  })
}
