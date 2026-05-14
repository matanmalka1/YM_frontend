import type { ActionCommand, BackendAction, BackendActionConfirm } from './types'

const HIDDEN_ACTION_KEYS = new Set<string>(['freeze', 'activate'])

const mapConfirm = (action: BackendAction): ActionCommand['confirm'] => {
  if (typeof action.confirm === 'boolean' && action.confirm) {
    return {
      title: action.confirm_title ?? 'אישור פעולה',
      message: action.confirm_message ?? 'האם להמשיך?',
      confirmLabel: 'אישור',
      cancelLabel: 'ביטול',
      inputs: undefined,
    }
  }

  if (!action.confirm || typeof action.confirm !== 'object') return undefined

  const confirm = action.confirm as BackendActionConfirm
  return {
    title: confirm.title,
    message: confirm.message,
    confirmLabel: confirm.confirm_label,
    cancelLabel: confirm.cancel_label,
    inputs: confirm.inputs,
  }
}

export const mapActions = (actions: BackendAction[] | null | undefined): ActionCommand[] => {
  if (!Array.isArray(actions)) return []

  return actions
    .filter((action) => !HIDDEN_ACTION_KEYS.has(action.key))
    .map((action) => {
      if (!action.endpoint) return null

      return {
        key: action.key,
        uiKey: action.id ?? action.key,
        id: action.id ?? action.key,
        label: action.label,
        method: action.method,
        endpoint: action.endpoint,
        payload: action.payload ?? undefined,
        confirm: mapConfirm(action),
        clientName: action.client_name ?? null,
        binderNumber: action.binder_number ?? null,
        category: action.category ?? null,
        dueLabel: action.due_label ?? null,
        description: action.description ?? null,
        urgency: action.urgency ?? null,
        dueDate: action.due_date ?? null,
      } as ActionCommand
    })
    .filter((a): a is ActionCommand => Boolean(a))
}
