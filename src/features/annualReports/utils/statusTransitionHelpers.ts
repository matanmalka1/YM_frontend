import { EMPTY_FORM } from './annualReportsUtils'
import type { TransitionForm } from '../types'
import type { AnnualReportStatus, StatusTransitionPayload } from '../api'
import { AMEND_REASON_MIN_LENGTH } from '../constants/statusTransitionConstants'

export const getEmptyTransitionForm = (): TransitionForm => ({ ...EMPTY_FORM })

export const isValidAmendReason = (reason: string) => reason.trim().length >= AMEND_REASON_MIN_LENGTH

export const buildTransitionPayload = (status: AnnualReportStatus, form: TransitionForm): StatusTransitionPayload => ({
  status,
  note: form.note || null,
  ita_reference: form.itaRef || null,
  submission_method: form.submissionMethod || null,
  assessment_amount: form.assessmentAmount || null,
  refund_due: form.refundDue || null,
  tax_due: form.taxDue || null,
})
