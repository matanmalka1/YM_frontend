import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { TaxSubmissionStats, useTaxDashboard } from '@/features/taxDashboard'
import { TAX_DASHBOARD_MESSAGES } from '../messages'
import { TAX_DASHBOARD_ERROR_MESSAGES } from '../errorMessages'

export const TaxDashboardPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('')
  const { currentYear, submissions, isLoading, hasError } = useTaxDashboard()

  const header = (
    <PageHeader title={TAX_DASHBOARD_MESSAGES.page.title} description={TAX_DASHBOARD_MESSAGES.page.description(currentYear)} />
  )

  return (
    <PageStateGuard
      isLoading={isLoading}
      error={hasError ? TAX_DASHBOARD_ERROR_MESSAGES.page.load : null}
      header={header}
      loadingMessage={TAX_DASHBOARD_MESSAGES.page.loadingMessage}
    >
      <TaxSubmissionStats data={submissions} activeFilter={activeFilter} onFilter={setActiveFilter} />
    </PageStateGuard>
  )
}
