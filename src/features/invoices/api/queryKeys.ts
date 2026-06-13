export const invoicesQK = {
  all: ['invoices'] as const,
  byChargeId: (chargeId: number) => [...invoicesQK.all, 'charge', chargeId] as const,
}
