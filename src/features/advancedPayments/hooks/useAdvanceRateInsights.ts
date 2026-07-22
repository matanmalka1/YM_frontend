import { useAdvancePaymentClientConfig } from './useAdvancePaymentClientConfig'

export const useAdvanceRateInsights = (clientId: number) => {
  const { config } = useAdvancePaymentClientConfig(clientId)

  const advanceRate = config?.advance_rate != null ? Number(config.advance_rate) : null
  const advancePaymentFrequency = config?.advance_payment_frequency ?? null

  return {
    advanceRate,
    advancePaymentFrequency,
  }
}
