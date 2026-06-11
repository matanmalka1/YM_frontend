import type { AnnualReportFull } from './api'
import type { AnnualReportStatus, StatusTransitionPayload } from './api'
import type { ChangeEvent } from 'react'

export const STAGE_ORDER = [
  'material_collection',
  'in_progress',
  'final_review',
  'client_signature',
  'transmitted',
  'post_submission',
] as const

export type StageKey = (typeof STAGE_ORDER)[number]

export type ActiveTab = 'season'

export const TAB_LABELS: Record<ActiveTab, string> = {
  season: 'עונה',
}

export const CURRENT_YEAR = new Date().getFullYear()

export const SECTION_KEYS = ['overview', 'financials', 'tax', 'deductions', 'timeline'] as const

export type SectionKey = (typeof SECTION_KEYS)[number]

export interface AnnualReportDetail extends AnnualReportFull {
  client_approved_at: string | null
  internal_notes: string | null
  stage?: StageKey
  due_date?: string | null
}

export interface TransitionForm {
  note: string
  itaRef: string
  submissionMethod: string
  assessmentAmount: string
  refundDue: string
  taxDue: string
}

export interface StatusTransitionPanelProps {
  report: AnnualReportFull
  onTransition: (payload: StatusTransitionPayload) => void
  isLoading: boolean
}

export interface AmendReportModalProps {
  open: boolean
  reason: string
  isPending: boolean
  onReasonChange: (value: string) => void
  onClose: () => void
  onSubmit: () => void
}

export interface TransitionTargetSelectorProps {
  allowed: AnnualReportStatus[]
  selected: AnnualReportStatus | null
  onSelect: (status: AnnualReportStatus) => void
}

export interface TransitionDetailsFormProps {
  selected: AnnualReportStatus
  form: TransitionForm
  isLoading: boolean
  onFieldChange: (field: keyof TransitionForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onCancel: () => void
  onSubmit: () => void
}
