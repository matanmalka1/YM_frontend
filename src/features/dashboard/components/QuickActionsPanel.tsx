import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { mapActions } from '@/lib/actions/mapActions'
import type { ActionCommand, BackendAction } from '@/lib/actions/types'
import { DashboardPanel, DashboardSectionHeader } from './DashboardPrimitives'

const MAX_VISIBLE_ACTIONS = 4

interface QuickActionView {
  id: string
  label: string
  description: string
  command?: ActionCommand
  href?: string
  modal?: 'charge' | 'client' | 'vat' | 'advancePayment'
}

interface QuickActionsPanelProps {
  actions: BackendAction[]
  activeActionKey?: string | null
  onAction: (action: ActionCommand) => void
  onOpenModal: (modal: NonNullable<QuickActionView['modal']>) => void
}

const ACTION_META: Record<string, { fallbackDescription: string }> = {
  vat_navigate: {
    fallbackDescription: 'פתיחת דוח לתקופה פעילה',
  },
  file_vat_return: {
    fallbackDescription: 'סימון דוח מע"מ כהוגש',
  },
  annual_report_client_reminder: {
    fallbackDescription: 'שליחת תזכורת ללקוח',
  },
  annual_report_navigate: {
    fallbackDescription: 'פתיחת דוח שנתי לטיפול',
  },
  binder_pickup_reminder: {
    fallbackDescription: 'שליחת תזכורת איסוף קלסר',
  },
  return: {
    fallbackDescription: 'סימון קלסר כהוחזר',
  },
  mark_paid: {
    fallbackDescription: 'סימון חיוב כשולם',
  },
}

const DEFAULT_ACTION_META = {
  fallbackDescription: 'ביצוע פעולה זמינה',
}

const STATIC_ACTIONS: QuickActionView[] = [
  {
    id: 'create-vat',
    label: 'צור דוח מע״מ חדש',
    description: 'יצירת דוח לתקופה חדשה',
    modal: 'vat',
  },
  {
    id: 'advance-payments',
    label: 'צור מקדמה חדשה',
    description: 'פתיחת טופס מקדמה חדשה',
    modal: 'advancePayment',
  },
  {
    id: 'create-charge',
    label: 'צור חיוב חדש',
    description: 'יצירת חיוב ללקוח',
    modal: 'charge',
  },
  {
    id: 'create-client',
    label: 'צור לקוח חדש',
    description: 'יצירת כרטיס לקוח',
    modal: 'client',
  },
]

const getActionMeta = (action: ActionCommand) => ACTION_META[action.key] ?? DEFAULT_ACTION_META

const buildDynamicActions = (rawActions: BackendAction[]): QuickActionView[] =>
  mapActions(rawActions).map((action) => {
    const meta = getActionMeta(action)
    return {
      id: action.uiKey,
      label: action.label,
      description: action.description ?? action.dueLabel ?? meta.fallbackDescription,
      command: action,
    }
  })

const dedupeActions = (actions: QuickActionView[]) => {
  const seen = new Set<string>()

  return actions.filter((action) => {
    const key = action.command?.key ?? action.href ?? action.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const QuickActionItem = ({
  action,
  activeActionKey,
  onAction,
  onOpenModal,
}: {
  action: QuickActionView
  activeActionKey: string | null
  onAction: (action: ActionCommand) => void
  onOpenModal: (modal: NonNullable<QuickActionView['modal']>) => void
}) => {
  const isLoading = action.command ? activeActionKey === action.command.uiKey : false
  const isDisabled = action.command ? activeActionKey !== null && !isLoading : false
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-950">{action.label}</p>
        <p className="mt-1 truncate text-xs font-medium text-slate-500">{action.description}</p>
      </div>
      {isLoading && (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      )}
      {!isLoading && <ChevronLeft className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />}
    </>
  )
  const className = cn(
    'flex w-full items-center gap-3 border-b border-slate-100 px-5 py-3 text-right transition-colors last:border-b-0 hover:bg-slate-50',
    isDisabled && 'cursor-not-allowed opacity-50',
  )

  if (action.command) {
    return (
      <button
        type="button"
        disabled={isDisabled || isLoading}
        onClick={() => onAction(action.command!)}
        className={className}
      >
        {content}
      </button>
    )
  }

  if (action.modal) {
    return (
      <button type="button" onClick={() => onOpenModal(action.modal!)} className={className}>
        {content}
      </button>
    )
  }

  return (
    <Link to={action.href ?? '/'} className={className}>
      {content}
    </Link>
  )
}

export const QuickActionsPanel = ({
  actions,
  activeActionKey = null,
  onAction,
  onOpenModal,
}: QuickActionsPanelProps) => {
  const quickActions = dedupeActions([...buildDynamicActions(actions), ...STATIC_ACTIONS]).slice(0, MAX_VISIBLE_ACTIONS)

  return (
    <DashboardPanel className="w-full xl:max-w-sm xl:justify-self-start">
      <div className="border-b border-slate-100 px-5 py-3">
        <DashboardSectionHeader title="פעולות מהירות" count={quickActions.length} tone="neutral" />
      </div>
      <div>
        {quickActions.map((action) => (
          <QuickActionItem
            key={action.id}
            action={action}
            activeActionKey={activeActionKey}
            onAction={onAction}
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
    </DashboardPanel>
  )
}

QuickActionsPanel.displayName = 'QuickActionsPanel'
