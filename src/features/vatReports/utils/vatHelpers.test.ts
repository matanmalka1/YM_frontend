import { describe, expect, it } from 'vitest'
import {
  canMutateVatInvoices,
  getVatInvoiceActionLabel,
  getVatInvoiceDisplayNumber,
  isGeneratedVatInvoiceNumber,
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

describe('canMutateVatInvoices', () => {
  it('uses backend available_actions as the source of truth for invoice row mutations', () => {
    expect(canMutateVatInvoices([addInvoiceAction])).toBe(true)
  })

  it('blocks invoice row mutations when the backend action is unavailable', () => {
    expect(canMutateVatInvoices([])).toBe(false)
  })
})
