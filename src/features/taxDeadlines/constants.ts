import { TAX_DEADLINE_TYPE_LABELS } from '../../utils/enums'
import { ALL_STATUSES_OPTION, ALL_TYPES_OPTION } from '@/constants/filterOptions.constants'

export const TAX_DEADLINE_CREATE_FORM_ID = 'tax-deadline-create-form'
export const EDIT_TAX_DEADLINE_FORM_ID = 'edit-tax-deadline-form'
export const GENERATE_TAX_DEADLINES_FORM_ID = 'generate-tax-deadlines-form'
export const REQUIRED_FIELD_MESSAGE = 'שדה חובה'
export const DUPLICATE_TAX_DEADLINE_MESSAGE = 'קיים כבר מועד פעיל לאותו לקוח, סוג ותקופה'

export const TAX_DEADLINE_TYPE_OPTIONS = Object.entries(TAX_DEADLINE_TYPE_LABELS)
  .filter(([value]) => value !== '')
  .map(([value, label]) => ({ value, label }))

export const TAX_DEADLINE_FILTER_TYPE_OPTIONS = [ALL_TYPES_OPTION, ...TAX_DEADLINE_TYPE_OPTIONS]

export const TAX_DEADLINE_STATUS_OPTIONS = [
  ALL_STATUSES_OPTION,
  { value: 'pending', label: 'ממתין' },
  { value: 'completed', label: 'הושלם' },
  { value: 'canceled', label: 'בוטל' },
]
