import { useIsMutating } from '@tanstack/react-query'
import { vatMutationKeys } from '../api/mutationKeys'

// True while a status transition or filing is in flight for this work item — including the
// cache invalidation that follows it, since the mutations await their own invalidation. Every
// action and every invoice edit stays locked until the refreshed work item has landed.
export const useVatLifecyclePending = (workItemId: number): boolean =>
  useIsMutating({ mutationKey: vatMutationKeys.lifecycle(workItemId) }) > 0
