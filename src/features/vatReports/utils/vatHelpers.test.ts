import { describe, expect, it } from 'vitest'
import {
  canAddOrEditVatInvoices,
  canDeleteVatInvoices,
  canMarkReadyForReview,
  getVatInvoiceActionLabel,
  getVatInvoiceDisplayNumber,
  isGeneratedVatInvoiceNumber,
  getVatInvoiceDefaultValues,
  getVatInvoiceCreationWarning,
} from './vatHelpers'
import type { BackendAction } from '@/lib/actions/types'
import type { VatInvoiceResponse } from '../api'

const addInvoiceAction: BackendAction = {
  key: 'add_invoice',
}

const invoice = (invoiceNumber: string): Pick<VatInvoiceResponse, 'id' | 'invoice_number'> => ({
  id: 2828,
  invoice_number: invoiceNumber,
})

describe('VAT invoice display helpers', () => {
  it('treats generated invoice-number fallbacks as missing user-facing numbers', () => {
    const generated = invoice('2026-05-income-dc05380c')

    expect(isGeneratedVatInvoiceNumber(generated)).toBe(true)
    expect(getVatInvoiceDisplayNumber(generated)).toBe('לא צוין')
    expect(getVatInvoiceActionLabel(generated)).toBe('חשבונית ללא מספר (#2828)')
  })

  it('supports the legacy generated fallback order observed in existing rows', () => {
    expect(isGeneratedVatInvoiceNumber(invoice('income-2026-05-dc05380c'))).toBe(true)
  })

  it('keeps real invoice numbers as the user-facing identifier', () => {
    const real = invoice('INV-1001')

    expect(isGeneratedVatInvoiceNumber(real)).toBe(false)
    expect(getVatInvoiceDisplayNumber(real)).toBe('INV-1001')
    expect(getVatInvoiceActionLabel(real)).toBe('חשבונית INV-1001')
  })

  it('treats empty invoice numbers as missing', () => {
    expect(getVatInvoiceDisplayNumber(invoice(''))).toBe('לא צוין')
    expect(getVatInvoiceDisplayNumber(invoice('   '))).toBe('לא צוין')
    expect(getVatInvoiceActionLabel(invoice('   '))).toBe('חשבונית ללא מספר (#2828)')
  })
})

describe('VAT invoice capabilities', () => {
  it('uses backend available_actions for add and edit access', () => {
    expect(canAddOrEditVatInvoices([addInvoiceAction])).toBe(true)
  })

  it('blocks add and edit when the backend action is unavailable', () => {
    expect(canAddOrEditVatInvoices([])).toBe(false)
  })

  it('requires the advisor-only delete capability in addition to an editable work item', () => {
    expect(canDeleteVatInvoices([addInvoiceAction], true)).toBe(true)
    expect(canDeleteVatInvoices([addInvoiceAction], false)).toBe(false)
  })

  // The backend action key is `ready_for_review` (vat_report_actions.py); the target
  // status it moves the item to is `awaiting_verification`. Matching on the status
  // name hides the button for every in_progress item.
  it('matches the backend ready_for_review action key, not the target status name', () => {
    expect(canMarkReadyForReview([{ key: 'ready_for_review' }])).toBe(true)
    expect(canMarkReadyForReview([{ key: 'awaiting_verification' }])).toBe(false)
  })
})

describe('VAT invoice defaults', () => {
  it('uses the category supplied by backend metadata instead of a frontend-owned legal default', () => {
    expect(getVatInvoiceDefaultValues('expense', 'canonical-category').expense_category).toBe('canonical-category')
    expect(getVatInvoiceDefaultValues('expense').expense_category).toBeUndefined()
  })
})

describe('VAT invoice creation feedback', () => {
  it('preserves the backend OSEK-PATUR ceiling warning for display', () => {
    expect(getVatInvoiceCreationWarning({ ceiling_warning: true })).toContain('תקרת')
    expect(getVatInvoiceCreationWarning({ ceiling_warning: false })).toBeNull()
  })
})
