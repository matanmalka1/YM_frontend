import { CATEGORY_LABELS } from './constants'
import { EXPENSE_CATEGORIES } from './constants'
import type { VatInvoiceRowValues } from './schemas/invoice.schema'
import { semanticMonoToneClasses } from '../../utils/semanticColors'
import type { BackendAction } from '@/lib/actions/types'

const hasVatAction = (actions: BackendAction[] | null | undefined, key: string): boolean =>
  actions?.some((action) => action.key === key) ?? false

export const canMarkMaterialsComplete = (actions: BackendAction[] | null | undefined): boolean =>
  hasVatAction(actions, 'materials_complete')

export const canAddInvoice = (actions: BackendAction[] | null | undefined): boolean =>
  hasVatAction(actions, 'add_invoice')

export const canMarkReadyForReview = (actions: BackendAction[] | null | undefined): boolean =>
  hasVatAction(actions, 'ready_for_review')

export const canSendBack = (actions: BackendAction[] | null | undefined): boolean => hasVatAction(actions, 'send_back')

export const canFile = (actions: BackendAction[] | null | undefined): boolean =>
  hasVatAction(actions, 'file_vat_return')

export const isFiled = (status: string): boolean => status === 'filed'

export const formatVatAmount = (amount: string | number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '—'
  const n = Number(amount)
  const abs = `₪${Math.abs(n).toFixed(2)}`
  return n < 0 ? `-${abs}` : abs
}

export const getVatDeductionRateLabel = (rate: string | number): string => {
  const numeric = Number(rate)
  if (numeric === 1) return '100%'
  if (numeric === 0) return '0%'
  return `${(numeric * 100).toFixed(2)}%`
}

export const getVatDeductionRateClass = (rate: string | number): string => {
  const numeric = Number(rate)
  if (numeric === 1) return `${semanticMonoToneClasses.positive} font-semibold`
  if (numeric === 0) return 'text-gray-400'
  return `${semanticMonoToneClasses.warning} font-semibold`
}

export const toDateInputValue = (dateStr: string): string => {
  try {
    return new Date(dateStr).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

export const getVatInvoiceGrossAmount = (netAmount: string | number, vatAmount: string | number): string =>
  (Number(netAmount) + Number(vatAmount)).toFixed(2)

export const getVatCategoryLabel = (category: string | null): string =>
  CATEGORY_LABELS[category ?? ''] ?? category ?? 'כללי'

export const getVatInvoiceDefaultValues = (invoiceType: 'income' | 'expense'): VatInvoiceRowValues => ({
  invoice_type: invoiceType,
  gross_amount: '',
  expense_category: invoiceType === 'expense' ? EXPENSE_CATEGORIES[0] : undefined,
})
