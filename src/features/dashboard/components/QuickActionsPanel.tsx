import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardPanel, DashboardSectionHeader } from './DashboardPrimitives'
import { QUICK_ACTIONS, type QuickActionDef } from '../dashboardConstants'
import type { DashboardCreateModal } from '../hooks/useDashboardCreateModals'

interface QuickActionsPanelProps {
  onOpenModal: (modal: DashboardCreateModal) => void
}

const QUICK_ACTION_TILE_CLASS =
  'flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-primary-100 hover:bg-primary-50/50'

const QuickActionItem = ({
  action,
  onOpenModal,
}: {
  action: QuickActionDef
  onOpenModal: (modal: DashboardCreateModal) => void
}) => {
  const content = (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <ChevronLeft className="h-5 w-5 text-primary-500" aria-hidden="true" />
      <p className="truncate text-sm font-bold text-slate-900">{action.label}</p>
    </div>
  )

  const modal = action.modal
  if (modal) {
    return (
      <button
        type="button"
        onClick={() => onOpenModal(modal)}
        className={QUICK_ACTION_TILE_CLASS}
        title={action.description}
      >
        {content}
      </button>
    )
  }

  return (
    <Link to={action.href ?? '/'} className={QUICK_ACTION_TILE_CLASS} title={action.description}>
      {content}
    </Link>
  )
}

export const QuickActionsPanel = ({ onOpenModal }: QuickActionsPanelProps) => (
  <DashboardPanel className="w-full">
    <div className="border-b border-slate-100 px-5 py-4">
      <DashboardSectionHeader title="פעולות מהירות" tone="neutral" />
    </div>
    <div className="grid grid-cols-2 gap-3 p-5">
      {QUICK_ACTIONS.map((action) => (
        <QuickActionItem key={action.id} action={action} onOpenModal={onOpenModal} />
      ))}
    </div>
  </DashboardPanel>
)

QuickActionsPanel.displayName = 'QuickActionsPanel'
