// INFRASTRUCTURE LAYER: Shared type contracts for the action system.
// Consumed by: lib/actions/runtime.ts, features/actions/hooks/*.ts
export type ActionMethod = 'get' | 'post' | 'patch' | 'put' | 'delete'

export interface BackendActionInputField {
  name: string
  label: string
  type: 'text'
  required?: boolean
}

export interface BackendActionConfirm {
  title: string
  message: string
  confirm_label: string
  cancel_label: string
  inputs?: BackendActionInputField[]
}

export interface BackendAction {
  id?: string | null
  key: string
  label: string
  method: ActionMethod
  endpoint: string
  payload?: Record<string, unknown> | null
  payload_schema?: 'none' | 'simple' | 'requires_input'
  confirm?: boolean | BackendActionConfirm | null
  confirm_title?: string | null
  confirm_message?: string | null
  variant?: 'primary' | 'secondary' | 'danger' | null
  binder_id?: number | null
  charge_id?: number | null
  client_id?: number | null
  client_name?: string | null
  binder_number?: string | null
  category?: string | null
  due_label?: string | null
  description?: string | null
  urgency?: 'overdue' | 'upcoming' | null
  due_date?: string | null
}

export type BackendActionInput = BackendAction

export interface ActionInputField {
  name: string
  label: string
  type: 'text'
  required?: boolean
}

export interface ActionConfirmConfig {
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  inputs?: ActionInputField[]
}

export interface ActionCommand {
  key: string
  uiKey: string
  id: string
  label: string
  method: ActionMethod
  endpoint: string
  payload?: Record<string, unknown>
  confirm?: ActionConfirmConfig
  clientName?: string | null
  binderNumber?: string | null
  category?: string | null
  dueLabel?: string | null
  description?: string | null
  urgency?: 'overdue' | 'upcoming' | null
  dueDate?: string | null
}
