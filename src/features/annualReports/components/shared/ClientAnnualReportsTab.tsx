import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Plus } from 'lucide-react'
import { useClientAnnualReportsTab } from '../../hooks/useClientAnnualReportsTab'
import { ClientYearComparisonModal } from './ClientYearComparisonModal'
import { CreateReportModal } from './CreateReportModal'
import { ReportHistoryTable } from '../panel/ReportHistoryTable'
import { DetailTabPanel } from '@/components/ui/layout'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { TableSkeleton } from '@/components/ui/table'
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

  return (
    <DetailTabPanel
      title={ANNUAL_REPORTS_MESSAGES.clientTab.title}
      subtitle={ANNUAL_REPORTS_MESSAGES.clientTab.subtitle}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            {ANNUAL_REPORTS_MESSAGES.clientTab.newReport}
          </Button>
          {canCompareYears && (
            <Button variant="ghost" size="sm" icon={<BarChart2 className="h-4 w-4" />} onClick={() => setShowComparison(true)}>
              {ANNUAL_REPORTS_MESSAGES.clientTab.compareYears}
            </Button>
          )}
        </div>
      }
    >
      {errorMessage ? (
        <Alert variant="error" message={errorMessage} />
      ) : isPending ? (
        <TableSkeleton rows={5} columns={6} />
      ) : (
        <ReportHistoryTable clientId={clientId} onSelect={openReportById} />
      )}

      <ClientYearComparisonModal
        open={canCompareYears && showComparison}
        onClose={() => setShowComparison(false)}
        reports={allReports}
      />
      <CreateReportModal open={showCreate} onClose={() => setShowCreate(false)} />
    </DetailTabPanel>
  )
}

ClientAnnualReportsTab.displayName = 'ClientAnnualReportsTab'
