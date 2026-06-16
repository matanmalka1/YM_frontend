import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/utils'
import { DashboardPanel, DashboardSectionHeader } from './DashboardPrimitives'

const MAX_VISIBLE_ACTIONS = 4

type QuickActionModal = 'charge' | 'client' | 'vat' | 'advancePayment'

interface QuickActionView {
  id: string
  label: string
  description: string
  href?: string
  modal?: QuickActionModal
}

interface QuickActionsPanelProps {
  onOpenModal: (modal: QuickActionModal) => void
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

const QuickActionItem = ({
  action,
  onOpenModal,
}: {
  action: QuickActionView
  onOpenModal: (modal: QuickActionModal) => void
}) => {
  const content = (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <ChevronLeft className="h-5 w-5 text-primary-500" aria-hidden="true" />
      <p className="truncate text-sm font-bold text-slate-900">{action.label}</p>
    </div>
  )
  const className = cn(
    'flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-primary-100 hover:bg-primary-50/50',
  )

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

export const QuickActionsPanel = ({ onOpenModal }: QuickActionsPanelProps) => {
  const quickActions = STATIC_ACTIONS.slice(0, MAX_VISIBLE_ACTIONS)

  return (
    <DashboardPanel className="w-full">
      <div className="border-b border-slate-100 px-5 py-4">
        <DashboardSectionHeader title="פעולות מהירות" tone="neutral" />
      </div>
      <div className="grid grid-cols-2 gap-3 p-5">
        {quickActions.map((action) => (
          <QuickActionItem key={action.id} action={action} onOpenModal={onOpenModal} />
        ))}
      </div>
    </DashboardPanel>
  )
}

QuickActionsPanel.displayName = 'QuickActionsPanel'
