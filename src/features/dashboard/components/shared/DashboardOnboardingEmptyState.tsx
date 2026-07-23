import { Link } from 'react-router-dom'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { IconChip } from '@/components/ui/primitives/IconChip'
import { DASHBOARD_ONBOARDING_COPY } from '../../constants'
import { DashboardPanel } from './DashboardLayout'

export const DashboardOnboardingEmptyState = () => {
  return (
    <DashboardPanel className="border-dashed">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <IconChip icon={UserPlus} size="xl" tone="primary" />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">{DASHBOARD_ONBOARDING_COPY.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{DASHBOARD_ONBOARDING_COPY.description}</p>
          </div>
        </div>
        <Link
          to="/clients?create=1"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-elevation-1 transition-colors hover:bg-primary-700"
        >
          {DASHBOARD_ONBOARDING_COPY.cta}
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </DashboardPanel>
  )
}

DashboardOnboardingEmptyState.displayName = 'DashboardOnboardingEmptyState'
