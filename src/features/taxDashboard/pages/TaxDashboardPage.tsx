import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { TaxSubmissionStats, useTaxDashboard } from '@/features/taxDashboard'

export const TaxDashboardPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('')
  const { currentYear, submissions, isLoading, hasError } = useTaxDashboard()

  const header = <PageHeader title="לוח מסים" description={`סקירת הגשות ומועדים לשנת ${currentYear}`} />

  return (
    <PageStateGuard
      isLoading={isLoading}
      error={hasError ? 'שגיאה בטעינת לוח המסים' : null}
      header={header}
      loadingMessage="טוען לוח מסים..."
    >
      <TaxSubmissionStats data={submissions} activeFilter={activeFilter} onFilter={setActiveFilter} />
    </PageStateGuard>
  )
}
