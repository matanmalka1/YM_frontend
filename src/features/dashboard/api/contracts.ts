import type { BackendAction } from '@/lib/actions/types'

export type AttentionItemType = 'unpaid_charge' | 'unpaid_charges'

interface BaseAttentionItem {
  item_type: AttentionItemType
  binder_id: number | null
  client_id: number | null
  business_id: number | null
  client_name: string | null
  description: string
}

export interface UnpaidChargeAttentionItem extends BaseAttentionItem {
  item_type: 'unpaid_charge'
  charge_id: number
  business_name: string | null
  charge_subject: string
  charge_date: string | null
  charge_amount: string
  charge_invoice_number: string
  charge_period: string | null
}

export interface UnpaidChargesAttentionItem extends BaseAttentionItem {
  item_type: 'unpaid_charges'
}

export type AttentionItem = UnpaidChargeAttentionItem | UnpaidChargesAttentionItem

export interface AttentionResponse {
  items: AttentionItem[]
  total: number
}

export interface AttentionEmptyCheck {
  key: string
  label: string
}

export interface AdvisorTodayItem {
  id: number
  label: string
  sublabel?: string | null
  description?: string | null
  href?: string | null
}

export interface AdvisorTodayResponse {
  deadline_items: AdvisorTodayItem[]
  reminder_items: AdvisorTodayItem[]
}

export interface VatDashboardPeriodStat {
  period: string
  period_label: string
  status_label: string
  submitted: number
  required: number
  pending: number
  completion_percent: number
}

export interface AdvancePaymentDashboardStats {
  monthly: VatDashboardPeriodStat
  bimonthly: VatDashboardPeriodStat
}

export interface VatDashboardStats {
  monthly: VatDashboardPeriodStat
  bimonthly: VatDashboardPeriodStat
  advance_payments: AdvancePaymentDashboardStats
}

export interface DashboardOverviewResponse {
  total_clients: number
  binders_in_office: number
  binders_ready_for_pickup: number
  manual_reminders_due_now: number
  open_charges_count: number
  open_charges_amount_ils: string | null
  vat_stats: VatDashboardStats
  quick_actions: BackendAction[]
  attention: AttentionResponse
  advisor_today: AdvisorTodayResponse
  attention_empty_checks: AttentionEmptyCheck[]
}
