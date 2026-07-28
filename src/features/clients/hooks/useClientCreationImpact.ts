import { useQuery } from '@tanstack/react-query'
import { clientsApi, clientsQK } from '../api'
import type { ClientCreationImpactResponse, ClientImpactPreviewPayload } from '../api/contracts'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

type ImpactParams = ClientImpactPreviewPayload

const buildImpactPreviewPayload = (params: ImpactParams): ClientImpactPreviewPayload => ({
  entity_type: params.entity_type,
  ...(params.vat_reporting_frequency ? { vat_reporting_frequency: params.vat_reporting_frequency } : {}),
  ...(params.advance_payment_frequency ? { advance_payment_frequency: params.advance_payment_frequency } : {}),
  ...(params.advance_rate ? { advance_rate: params.advance_rate } : {}),
  // Forwarded so the preview counts the same periods the create will produce.
  ...(params.vat_liable_from ? { vat_liable_from: params.vat_liable_from } : {}),
  ...(params.vat_liable_to ? { vat_liable_to: params.vat_liable_to } : {}),
  ...(params.advance_liable_from ? { advance_liable_from: params.advance_liable_from } : {}),
  ...(params.advance_liable_to ? { advance_liable_to: params.advance_liable_to } : {}),
})

export const useClientCreationImpact = (
  params: Partial<ImpactParams> | null,
): {
  data: ClientCreationImpactResponse | undefined
  isError: boolean
  isLoading: boolean
} => {
  const enabled = !!(
    params?.entity_type &&
    (params.entity_type === 'osek_patur' || params?.vat_reporting_frequency) &&
    (params.entity_type === 'osek_patur' || params?.advance_payment_frequency)
  )

  return useQuery({
    queryKey: clientsQK.creationImpact(params),
    queryFn: () =>
      clientsApi.previewImpact(
        buildImpactPreviewPayload({
          entity_type: params!.entity_type!,
          vat_reporting_frequency: params!.vat_reporting_frequency,
          advance_payment_frequency: params!.advance_payment_frequency,
          advance_rate: params!.advance_rate,
          vat_liable_from: params!.vat_liable_from,
          vat_liable_to: params!.vat_liable_to,
          advance_liable_from: params!.advance_liable_from,
          advance_liable_to: params!.advance_liable_to,
        }),
      ),
    enabled,
    retry: false,
    staleTime: QUERY_STALE_TIME.medium,
  })
}
