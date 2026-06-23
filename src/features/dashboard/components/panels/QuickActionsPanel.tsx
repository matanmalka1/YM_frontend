import { ActionSurfaceButton, ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { QUICK_ACTIONS, type QuickActionDef } from '../../constants'
import type { DashboardCreateModal } from '../../hooks/useDashboardCreateModals'

interface QuickActionsPanelProps {
  onOpenModal: (modal: DashboardCreateModal) => void
}

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
      <ActionSurfaceButton variant="tile" onClick={() => onOpenModal(action.modal!)} title={action.description}>
        {inner}
      </ActionSurfaceButton>
    )
  }

  return (
    <ActionSurfaceLink variant="tile" to={action.href ?? '/'} title={action.description}>
      {inner}
    </ActionSurfaceLink>
  )
}

export const QuickActionsPanel = ({ onOpenModal }: QuickActionsPanelProps) => (
  <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-elevation-1">
    <span className="mb-3 block text-2xs font-semibold uppercase tracking-wider text-slate-400">פעולות מהירות</span>
    <div className="grid grid-cols-2 gap-2.5">
      {QUICK_ACTIONS.map((action) => (
        <QuickActionItem key={action.id} action={action} onOpenModal={onOpenModal} />
      ))}
    </div>
  </div>
)

QuickActionsPanel.displayName = 'QuickActionsPanel'
