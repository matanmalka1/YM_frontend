import type { AnnualReportFull } from './api'
import type { AnnualReportStatus, StatusTransitionPayload } from './api'
import type { ChangeEvent } from 'react'

type StageKey =
  | 'material_collection'
  | 'in_progress'
  | 'final_review'
  | 'client_signature'
  | 'transmitted'
  | 'post_submission'

export const CURRENT_YEAR = new Date().getFullYear()

export type SectionKey = 'overview' | 'financials' | 'tax' | 'deductions' | 'annex' | 'timeline'

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
