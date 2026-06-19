import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { QUICK_ACTIONS, type QuickActionDef } from '../../dashboardConstants'
import type { DashboardCreateModal } from '../../hooks/useDashboardCreateModals'

interface QuickActionsPanelProps {
  onOpenModal: (modal: DashboardCreateModal) => void
}

const TILE_CLASS =
  'flex flex-col items-start gap-2.5 rounded-xl border border-transparent bg-slate-50 p-3.5 text-start font-semibold text-slate-800 text-sm transition-all hover:border-primary-200 hover:bg-white hover:shadow-elevation-1'

const QuickActionItem = ({
  action,
  onOpenModal,
}: {
  action: QuickActionDef
  onOpenModal: (modal: DashboardCreateModal) => void
}) => {
  const { icon: Icon } = action
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <Icon className="h-4 w-4" />
      </span>
      <span>{action.label}</span>
    </>
  )

  if (action.modal) {
    return (
      <button type="button" onClick={() => onOpenModal(action.modal!)} className={cn(TILE_CLASS)} title={action.description}>
        {inner}
      </button>
    )
  }

  return (
    <Link to={action.href ?? '/'} className={cn(TILE_CLASS)} title={action.description}>
      {inner}
    </Link>
  )
}

export const QuickActionsPanel = ({ onOpenModal }: QuickActionsPanelProps) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-elevation-1">
    <span className="mb-3 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">פעולות מהירות</span>
    <div className="grid grid-cols-2 gap-2.5">
      {QUICK_ACTIONS.map((action) => (
        <QuickActionItem key={action.id} action={action} onOpenModal={onOpenModal} />
      ))}
    </div>
  </div>
)

QuickActionsPanel.displayName = 'QuickActionsPanel'
