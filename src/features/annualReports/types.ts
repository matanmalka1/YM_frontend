import type { ObligationStatus } from '@/constants/obligationStatus.constants'
import type { AnnualReportFull } from './api'
import type { StatusTransitionPayload } from './api'
import type { ChangeEvent } from 'react'

export type SectionKey = 'overview' | 'financials' | 'tax' | 'deductions' | 'annex' | 'timeline'

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

export interface TransitionTargetSelectorProps {
  allowed: ObligationStatus[]
  selected: ObligationStatus | null
  onSelect: (status: ObligationStatus) => void
}

export interface TransitionDetailsFormProps {
  selected: ObligationStatus
  form: TransitionForm
  isLoading: boolean
  onFieldChange: (field: keyof TransitionForm) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onCancel: () => void
  onSubmit: () => void
}
