import type { BackendAction } from '@/lib/actions/types'
import type { PaginatedResponse } from '@/types'

export type DeadlineUrgencyLevel = 'overdue' | 'critical' | 'warning' | 'normal' | 'none'

export interface TaxDeadlineResponse {
  id: number
  client_record_id: number
  office_client_number?: number | null
  client_name: string | null
  deadline_type: string
  period: string | null
  tax_year: number | null
  due_date: string
  status: string
  payment_amount: string | null
  description: string | null
  completed_at: string | null
  completed_by: number | null
  advance_payment_id: number | null
  vat_work_item_id: number | null
  period_months_count?: 1 | 2 | null
  created_at: string
  urgency_level: DeadlineUrgencyLevel
  available_actions?: BackendAction[]
}

export interface DeadlineUrgentItem {
  id: number
  client_record_id: number
  client_name: string
  deadline_type: string
  due_date: string
  urgency_level: DeadlineUrgencyLevel
  days_remaining: number
  payment_amount: string | null
}

export type TaxDeadlineListResponse = PaginatedResponse<TaxDeadlineResponse>

export interface DeadlineGroupPeriod {
  period: string
  period_months_count?: 1 | 2 | null
}

export interface DeadlineGroup {
  group_key: string
  deadline_type: string
  period: string | null
  period_months_count?: 1 | 2 | null
  tax_year: number | null
  periods?: DeadlineGroupPeriod[]
  tax_years?: number[]
  due_date: string
  total_clients: number
  pending_count: number
  completed_count: number
  canceled_count: number
  overdue_count: number
  total_amount: string | null
  open_amount: string | null
  worst_urgency: DeadlineUrgencyLevel
}

export interface GroupedDeadlineListResponse {
  groups: DeadlineGroup[]
  total_groups: number
  total_client_deadlines: number
}
