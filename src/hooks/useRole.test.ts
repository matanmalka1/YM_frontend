import { describe, expect, it } from 'vitest'
import { getRoleCapabilities } from './useRole'

describe('role capabilities', () => {
  it('allows secretaries to use backend-supported operational workflows', () => {
    expect(getRoleCapabilities('secretary')).toMatchObject({
      sendNotifications: true,
      manageSignatureRequests: true,
      createVatWorkItems: true,
      addOrEditVatInvoices: true,
      deleteVatInvoices: false,
      manageCharges: true,
    })
  })

  it('allows advisors to delete VAT invoices', () => {
    expect(getRoleCapabilities('advisor').deleteVatInvoices).toBe(true)
  })

  it('denies every protected capability without an authenticated role', () => {
    expect(Object.values(getRoleCapabilities(null))).toEqual(expect.arrayContaining([false]))
    expect(Object.values(getRoleCapabilities(null)).every((value) => value === false)).toBe(true)
  })
})
