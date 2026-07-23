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
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-1 ring-primary-100">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <span className="block text-sm font-bold text-slate-900">{action.label}</span>
        <span className="mt-0.5 block text-2xs font-medium leading-relaxed text-slate-500">{action.description}</span>
      </div>
    </>
  )

  if (action.modal) {
    return (
      <ActionSurfaceButton variant="tile" className="w-full"onClick={() => onOpenModal(action.modal!)}title={action.description}>
        {inner}
      </ActionSurfaceButton>
    )
  }

  return (
    <ActionSurfaceLink variant="tile" className="w-full" to={action.href ?? '/'} title={action.description}>
      {inner}
    </ActionSurfaceLink>
  )
}

export const QuickActionsPanel = ({ onOpenModal }: QuickActionsPanelProps) => (
  <Card variant="soft" size="compact">
    <span className="mb-3.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
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
