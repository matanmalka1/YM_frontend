import { describe, expect, it } from 'vitest'
import { toInvoiceEditPayload, toInvoiceRowPayload, type VatInvoiceEditValues } from './invoice.schema'

const editValues = (overrides: Partial<VatInvoiceEditValues> = {}): VatInvoiceEditValues => ({
  gross_amount: '117.00',
  invoice_number: 'INV-1',
  invoice_date: '2026-07-22',
  counterparty_name: 'ספק',
  counterparty_id: '515112399',
  counterparty_id_type: 'il_business',
  ...overrides,
})

describe('VAT invoice payload serialization', () => {
  it('omits absent non-clearable classification fields from an income edit', () => {
    expect(toInvoiceEditPayload(editValues())).toEqual({
      gross_amount: '117.00',
      invoice_number: 'INV-1',
      invoice_date: '2026-07-22',
      counterparty_name: 'ספק',
      counterparty_id: '515112399',
      counterparty_id_type: 'il_business',
    })
  })

  it('does not clear document type when editing an expense', () => {
    expect(toInvoiceEditPayload(editValues({ expense_category: 'vehicle', document_type: undefined }))).toMatchObject({
      expense_category: 'vehicle',
    })
    expect(toInvoiceEditPayload(editValues({ expense_category: 'vehicle' }))).not.toHaveProperty('document_type')
  })

  it('sends explicit nulls for both counterparty fields when they are cleared', () => {
    expect(toInvoiceEditPayload(editValues({ counterparty_id: '', counterparty_id_type: undefined }))).toMatchObject({
      counterparty_id: null,
      counterparty_id_type: null,
    })
  })

  it('retains create normalization independently from PATCH presence semantics', () => {
    expect(toInvoiceRowPayload({ invoice_type: 'income', gross_amount: '117.00' })).toMatchObject({
      invoice_type: 'income',
      expense_category: null,
      document_type: null,
    })
  })
})
