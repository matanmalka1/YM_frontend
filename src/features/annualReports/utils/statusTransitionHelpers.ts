import type { ObligationStatus } from '@/constants/obligationStatus.constants'
import { EMPTY_FORM } from './annualReportsUtils'
import type { TransitionForm } from '../types'
import type { StatusTransitionPayload } from '../api'

export const getEmptyTransitionForm = (): TransitionForm => ({ ...EMPTY_FORM })

export const buildTransitionPayload = (status: ObligationStatus, form: TransitionForm): StatusTransitionPayload => ({
  status,
  note: form.note || null,
  ita_reference: form.itaRef || null,
  submission_method: form.submissionMethod || null,
  assessment_amount: form.assessmentAmount || null,
  refund_due: form.refundDue || null,
  tax_due: form.taxDue || null,
})
