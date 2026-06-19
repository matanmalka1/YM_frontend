import { EXPENSE_CATEGORIES } from '../constants'
import type { VatInvoiceRowValues } from '../schemas/invoice.schema'
import { formatCurrencyILS, formatPercent } from '../../../utils/utils'
import { semanticMonoToneClasses } from '../../../utils/semanticColors'
import type { BackendAction } from '@/lib/actions/types'
import type { VatInvoiceResponse, VatWorkItemStatus } from '../api'

const hasVatAction = (actions: BackendAction[] | null | undefined, key: string): boolean =>
  actions?.some((action) => action.key === key) ?? false

export const canMarkMaterialsComplete = (actions: BackendAction[] | null | undefined): boolean =>
  hasVatAction(actions, 'materials_complete')

const canAddInvoice = (actions: BackendAction[] | null | undefined): boolean => hasVatAction(actions, 'add_invoice')

export const canMutateVatInvoices = (actions: BackendAction[] | null | undefined): boolean => canAddInvoice(actions)

export const canMarkReadyForReview = (actions: BackendAction[] | null | undefined): boolean =>
  hasVatAction(actions, 'ready_for_review')

export const canSendBack = (actions: BackendAction[] | null | undefined): boolean => hasVatAction(actions, 'send_back')

export const canFile = (actions: BackendAction[] | null | undefined): boolean =>
  hasVatAction(actions, 'file_vat_return')

export const isFiled = (status: VatWorkItemStatus): boolean => status === 'filed'

const MISSING_INVOICE_NUMBER_LABEL = 'לא צוין'
const GENERATED_INVOICE_NUMBER_PATTERN =
  /^(?:\d{4}-\d{2}-(?:income|expense)|(?:income|expense)-\d{4}-\d{2})-[a-f0-9]{8}$/i

export const isGeneratedVatInvoiceNumber = (invoice: Pick<VatInvoiceResponse, 'invoice_number'>): boolean =>
  GENERATED_INVOICE_NUMBER_PATTERN.test(invoice.invoice_number.trim())

export const getVatInvoiceDisplayNumber = (invoice: Pick<VatInvoiceResponse, 'invoice_number'>): string => {
  const value = invoice.invoice_number.trim()
  if (!value || isGeneratedVatInvoiceNumber({ invoice_number: value })) return MISSING_INVOICE_NUMBER_LABEL
  return value
}

export const getVatInvoiceActionLabel = (invoice: Pick<VatInvoiceResponse, 'id' | 'invoice_number'>): string => {
  const displayNumber = getVatInvoiceDisplayNumber(invoice)
  return displayNumber === MISSING_INVOICE_NUMBER_LABEL
    ? `חשבונית ללא מספר (#${invoice.id})`
    : `חשבונית ${displayNumber}`
}

export const formatVatAmount = (amount: string | number | null | undefined): string =>
  formatCurrencyILS(amount, { fractionDigits: 2 })

export const getVatDeductionRateLabel = (rate: string | number): string => {
  const numeric = Number(rate)
  if (numeric === 1) return '100%'
  if (numeric === 0) return '0%'
  return formatPercent(numeric, { isRatio: true, fractionDigits: 2 })
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

export const getVatInvoiceDefaultValues = (invoiceType: 'income' | 'expense'): VatInvoiceRowValues => ({
  invoice_type: invoiceType,
  gross_amount: '',
  expense_category: invoiceType === 'expense' ? EXPENSE_CATEGORIES[0] : undefined,
})
