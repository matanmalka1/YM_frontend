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
  annual_report_navigate: {
    fallbackDescription: 'פתיחת דוח שנתי לטיפול',
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
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      {isLoading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-400 border-t-transparent" />
      ) : (
        <ChevronLeft className="h-5 w-5 text-primary-500" aria-hidden="true" />
      )}
      <p className="truncate text-sm font-bold text-slate-900">{action.label}</p>
    </div>
  )
  const className = cn(
    'flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-primary-100 hover:bg-primary-50/50',
    isDisabled && 'cursor-not-allowed opacity-50',
  )

  if (action.command) {
    return (
      <button
        type="button"
        disabled={isDisabled || isLoading}
        onClick={() => onAction(action.command!)}
        className={className}
        title={action.description}
      >
        {content}
      </button>
    )
  }

  if (action.modal) {
    return (
      <button type="button" onClick={() => onOpenModal(action.modal!)} className={className} title={action.description}>
        {content}
      </button>
    )
  }

  return (
    <Link to={action.href ?? '/'} className={className} title={action.description}>
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
    <DashboardPanel className="w-full">
      <div className="border-b border-slate-100 px-5 py-4">
        <DashboardSectionHeader title="פעולות מהירות" tone="neutral" />
      </div>
      <div className="grid grid-cols-2 gap-3 p-5">
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
