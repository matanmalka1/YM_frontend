export type AttentionUrgency = 'overdue' | 'approaching' | 'important' | 'upcoming'

export interface AttentionBoardItem {
  id: string
  source_type: string
  source_id: number
  title: string
  client_name: string | null
  due_date: string | null
  days_delta: number
  reason: string | null
  amount: string | null
  urgency: AttentionUrgency
  href: string
}

interface AttentionResponse {
  items: AttentionBoardItem[]
  total: number
}

interface VatDashboardPeriodStat {
  period: string
  period_label: string
  status_label: string
  submitted: number
  required: number
  pending: number
  completion_percent: number
}

interface AdvancePaymentDashboardStats {
  monthly: VatDashboardPeriodStat
  bimonthly: VatDashboardPeriodStat
}

export interface VatDashboardStats {
  monthly: VatDashboardPeriodStat
  bimonthly: VatDashboardPeriodStat
  advance_payments: AdvancePaymentDashboardStats
}

export interface RecentActivityItem {
  id: number
  date: string
  time: string
  label: string
  client_name: string
  href: string
  activity_type: string
}

export interface DashboardOverviewResponse {
  is_empty: boolean
  open_charges_count: number
  open_charges_amount_ils: string | null
  vat_stats: VatDashboardStats
  attention: AttentionResponse
  recent_activity: RecentActivityItem[]
}
