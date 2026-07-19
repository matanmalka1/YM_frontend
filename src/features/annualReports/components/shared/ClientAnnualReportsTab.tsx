import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Plus } from 'lucide-react'
import { useClientAnnualReportsTab } from '../../hooks/useClientAnnualReportsTab'
import { PageLoading } from '../../../../components/ui/layout/PageLoading'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { Button } from '../../../../components/ui/primitives/Button'
import { ClientYearComparisonModal } from './ClientYearComparisonModal'
import { CreateReportModal } from './CreateReportModal'
import { ReportHistoryTable } from '../panel/ReportHistoryTable'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface ClientAnnualReportsTabProps {
  clientId: number
}

export const ClientAnnualReportsTab: React.FC<ClientAnnualReportsTabProps> = ({ clientId }) => {
  const { allReports, isPending, errorMessage } = useClientAnnualReportsTab(clientId)
  const [showComparison, setShowComparison] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()
  const canCompareYears = new Set(allReports.map((report) => report.tax_year)).size >= 2

  const openReportById = (reportId: number) => {
    navigate(`/clients/${clientId}/annual-reports/${reportId}`)
  }

  if (isPending) return <PageLoading message={ANNUAL_REPORTS_MESSAGES.clientTab.loading} />
  if (errorMessage) return <Alert variant="error" message={errorMessage} />

  return (
    <>
      <div className="flex justify-end mb-2 gap-2">
        {canCompareYears && (
          <Button
            variant="ghost"
            size="sm"
            icon={<BarChart2 className="h-4 w-4" />}
            onClick={() => setShowComparison(true)}
          >
            {ANNUAL_REPORTS_MESSAGES.clientTab.compareYears}
          </Button>
        )}
        <Button variant="ghost" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
          {ANNUAL_REPORTS_MESSAGES.clientTab.newReport}
        </Button>
      </div>

      <ReportHistoryTable clientId={clientId} currentReportId={-1} onSelect={openReportById} />

      <ClientYearComparisonModal
        open={canCompareYears && showComparison}
        onClose={() => setShowComparison(false)}
        reports={allReports}
      />
      <CreateReportModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  )
}

ClientAnnualReportsTab.displayName = 'ClientAnnualReportsTab'
