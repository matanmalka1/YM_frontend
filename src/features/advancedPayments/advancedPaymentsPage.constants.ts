import { ALL_TYPES_OPTION, ALL_YEARS_URL_OPTION } from '@/constants/filterOptions.constants'
import {
  getOperationalTaxYear,
  getOperationalYearOptions,
  MONTHS_COVERED_OPTIONS,
} from '@/constants/periodOptions.constants'
import { ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL } from './constants'

const PERIOD_OPTIONS = [ALL_TYPES_OPTION, ...MONTHS_COVERED_OPTIONS]
const YEAR_OPTIONS = [ALL_YEARS_URL_OPTION, ...getOperationalYearOptions()]

export const ADVANCE_PAYMENTS_FILTER_FIELDS = [
  { type: 'client-picker' as const, idKey: 'client_record_id', nameKey: 'client_name', label: 'לקוח' },
  {
    type: 'select' as const,
    key: 'year',
    label: 'שנה',
    options: YEAR_OPTIONS,
    defaultValue: String(getOperationalTaxYear()),
  },
  {
    type: 'select' as const,
    key: 'status',
    label: 'סטטוס',
    options: ADVANCE_PAYMENT_STATUS_OPTIONS_WITH_ALL,
  },
  { type: 'select' as const, key: 'period', label: 'תקופת מקדמה', options: PERIOD_OPTIONS },
]
