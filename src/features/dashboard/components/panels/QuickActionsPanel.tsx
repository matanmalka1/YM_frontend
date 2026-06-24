import { ActionSurfaceButton, ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { Card } from '@/components/ui/primitives/Card'
import { QUICK_ACTIONS, type QuickActionDef } from '../../constants'
import type { DashboardCreateModal } from '../../hooks/useDashboardCreateModals'
import { DASHBOARD_MESSAGES } from '../../messages'

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
  <Card variant="soft" size="compact">
    <span className="mb-3 block text-2xs font-semibold uppercase tracking-wider text-slate-400">
      {DASHBOARD_MESSAGES.quickActions.title}
    </span>
    <div className="grid grid-cols-2 gap-2.5">
      {QUICK_ACTIONS.map((action) => (
        <QuickActionItem key={action.id} action={action} onOpenModal={onOpenModal} />
      ))}
    </div>
  </Card>
)

QuickActionsPanel.displayName = 'QuickActionsPanel'
