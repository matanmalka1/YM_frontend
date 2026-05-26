import { useCallback, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from '../../../utils/toast'
import { showErrorToast } from '../../../utils/utils'
import { executeAction } from '../../../lib/actions/runtime'
import { useConfirmableAction } from './useConfirmableAction'
import type { ActionCommand } from '../../../lib/actions/types'

interface UseActionRunnerOptions {
  onSuccess?: () => Promise<void> | void
  errorFallback?: string
  onError?: (error: unknown) => void
}

export const useActionRunner = (options: UseActionRunnerOptions = {}) => {
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null)
  const activeActionKeyRef = useRef<string | null>(null)

  const actionMutation = useMutation({
    mutationFn: (action: ActionCommand) => executeAction(action),
    onSuccess: async () => {
      toast.success('הפעולה הושלמה בהצלחה')
      await options.onSuccess?.()
    },
  })

  const runAction = useCallback(
    async (action: ActionCommand) => {
      setActiveActionKey(action.uiKey)
      activeActionKeyRef.current = action.uiKey
      try {
        await actionMutation.mutateAsync(action)
      } catch (err) {
        showErrorToast(err, options.errorFallback ?? 'שגיאה בביצוע פעולה')
        options.onError?.(err)
      } finally {
        setActiveActionKey(null)
        activeActionKeyRef.current = null
      }
    },
    [actionMutation, options],
  )

  const { cancelPendingAction, confirmPendingAction, handleAction, pendingAction } = useConfirmableAction(
    runAction,
    (a) => Boolean(a.confirm),
  )

  return {
    activeActionKey,
    activeActionKeyRef,
    handleAction,
    pendingAction,
    confirmPendingAction,
    cancelPendingAction,
  }
}
