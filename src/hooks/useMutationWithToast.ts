import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/utils/toast'
import { showErrorToast } from '@/utils/utils'

type Options<TData, TVariables> = {
  mutationFn: (vars: TVariables) => Promise<TData>
  successMessage?: string | ((data: TData) => string)
  errorMessage: string
  invalidateKeys?: readonly (readonly unknown[])[]
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>
  // Tags the mutation so unrelated components can observe it via `useIsMutating`,
  // instead of prop-drilling an "in flight" boolean down the tree.
  mutationKey?: readonly unknown[]
}

export const useMutationWithToast = <TData, TVariables>(options: Options<TData, TVariables>) => {
  const queryClient = useQueryClient()
  return useMutation<TData, Error, TVariables>({
    mutationKey: options.mutationKey,
    mutationFn: options.mutationFn,
    onSuccess: async (data, variables) => {
      if (options.successMessage) {
        const msg = typeof options.successMessage === 'function' ? options.successMessage(data) : options.successMessage
        toast.success(msg)
      }
      if (options.invalidateKeys) {
        await Promise.all(options.invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })))
      }
      await options.onSuccess?.(data, variables)
    },
    onError: (err) => showErrorToast(err, options.errorMessage),
  })
}
