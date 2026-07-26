import { useState } from 'react'
import { Percent } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, type ButtonVariant } from '@/components/ui/primitives/Button'
import { clientsQK } from '@/features/clients/api'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'
import { advancePaymentsApi, advancedPaymentsQK } from '../../api'
import type { BulkRateUpdatePayload } from '../../api/contracts'
import { useAdvanceRateInsights } from '../../hooks/useAdvanceRateInsights'
import { ADVANCED_PAYMENTS_MESSAGES } from '../../messages'
import { ADVANCED_PAYMENTS_ERROR_MESSAGES } from '../../errorMessages'
import { AdvanceRateChangeModal } from './AdvanceRateChangeModal'

interface AdvanceRateChangeButtonProps {
  clientRecordId: number
  variant?: ButtonVariant
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

/**
 * Self-contained "change advance rate" action — the single entry point for a
 * rate change, mounted on both the advance-payments tab and the client-details
 * screen. Opens one modal (new rate + from-period) and hits one endpoint, which
 * reprices the client's pending periods from the chosen period and rewrites the
 * default. Needs only the client id; rate/frequency are read internally.
 */
export const AdvanceRateChangeButton: React.FC<AdvanceRateChangeButtonProps> = ({
  clientRecordId,
  variant = 'secondary',
  size = 'sm',
}) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { advanceRate, advancePaymentFrequency } = useAdvanceRateInsights(clientRecordId)

  const mutation = useMutation({
    mutationFn: (payload: BulkRateUpdatePayload) => advancePaymentsApi.bulkRateUpdate(clientRecordId, payload),
    onSuccess: (result) => {
      toast.success(ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.result(result))
      setOpen(false)
      void queryClient.invalidateQueries({ queryKey: advancedPaymentsQK.all })
      // The default rate moved too — refresh the client config the rate chip reads.
      void queryClient.invalidateQueries({ queryKey: clientsQK.detail(clientRecordId) })
    },
    onError: (err) => showErrorToast(err, ADVANCED_PAYMENTS_ERROR_MESSAGES.bulkRateUpdate.failed),
  })

  return (
    <>
      <Button variant={variant} size={size} icon={<Percent className="h-4 w-4" />} onClick={() => setOpen(true)}>
        {ADVANCED_PAYMENTS_MESSAGES.bulkRateUpdate.actionButton}
      </Button>
      <AdvanceRateChangeModal
        open={open}
        periodMonthsCount={advancePaymentFrequency === 'bimonthly' ? 2 : 1}
        currentRate={advanceRate}
        isSubmitting={mutation.isPending}
        onClose={() => setOpen(false)}
        onSubmit={(payload) => mutation.mutate(payload)}
      />
    </>
  )
}
