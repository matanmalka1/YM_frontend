import { useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutationWithToast } from '@/hooks/useMutationWithToast'
import { toSiblingRecordPath } from '@/utils/recordPath'
import { vatReportsApi } from '../api'
import { vatMutationKeys } from '../api/mutationKeys'
import { invalidateVatWorkItem } from './useVatInvalidation'
import type { VatWorkItemResponse } from '../api'
import { VAT_MESSAGES } from '../messages'
import { VAT_ERROR_MESSAGES } from '../errorMessages'

/**
 * Open a correction of a closed period as a new record (D-10, D-21).
 *
 * The original is invalidated as well as the amendment: it has just gained a
 * `superseded_at`, and a stale cache would keep offering "amend" on a record
 * that already has one. Both chains go with them — the key sits outside the
 * list/detail space, so nothing else would refresh it.
 *
 * The page then moves to the correction. The record left behind is closed and
 * locked (D-13), so staying on it leaves the advisor on the one screen where
 * the corrected figures cannot be entered — and the amendment is what every
 * other screen now shows for the period (D-12).
 */
export const useCreateVatAmendment = (workItemId: number) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const mutation = useMutationWithToast<VatWorkItemResponse, void>({
    mutationKey: vatMutationKeys.lifecycle(workItemId),
    mutationFn: () => vatReportsApi.createAmendment(workItemId),
    successMessage: VAT_MESSAGES.mutations.amendmentSuccess,
    errorMessage: VAT_ERROR_MESSAGES.mutations.amendmentError,
    onSuccess: async (amendment) => {
      await Promise.all([
        invalidateVatWorkItem(queryClient, {
          workItemId,
          clientRecordId: amendment.client_record_id,
          includeAudit: true,
          includeChain: true,
        }),
        invalidateVatWorkItem(queryClient, {
          workItemId: amendment.id,
          clientRecordId: amendment.client_record_id,
          includeChain: true,
        }),
      ])
      // Pushed, not replaced — unlike withdrawing. The record left behind still
      // exists and is still the period's filed history, so Back is a real place
      // to go; a withdrawn correction's URL answers 404.
      navigate(toSiblingRecordPath(pathname, amendment.id))
    },
  })

  return { createAmendment: mutation.mutateAsync, isLoading: mutation.isPending }
}
