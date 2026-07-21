import { useState } from 'react'
import { ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { ReportAlertBanners } from './ReportAlertBanners'
import { AnnualReportSummaryStrip } from './AnnualReportSummaryStrip'
import { ReportMetaGrid } from './ReportMetaGrid'
import { AnnualReportDetailForm } from '../tax/AnnualReportDetailForm'
import { AnnualPLSummary } from '../financials/AnnualPLSummary'
import type { AnnualReportDetail } from '../../types'
import type { AnnualReportFull } from '../../api'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface Props {
  report: AnnualReportFull
  detail: AnnualReportDetail | null
  advances?: { balance_type: 'due' | 'refund' | 'zero'; final_balance: number }
  onDetailSave: (data: Partial<AnnualReportDetail>) => void
  clientId: number
  onDirtyChange?: (dirty: boolean) => void
  submitRef?: React.RefObject<(() => void) | null>
}

export const AnnualReportOverviewTab: React.FC<Props> = ({
  report,
  detail,
  advances,
  onDetailSave,
  clientId,
  onDirtyChange,
  submitRef,
}) => {
  const [plExpanded, setPlExpanded] = useState(false)

  return (
    <div className="space-y-6">
      <ReportAlertBanners report={report} advances={advances} />

      <AnnualReportSummaryStrip report={report} />

      {/* Meta + detail form */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title={ANNUAL_REPORTS_MESSAGES.overviewSection.detailsCardTitle} size="compact">
          <ReportMetaGrid report={report} />
        </Card>
        <Card title={ANNUAL_REPORTS_MESSAGES.overviewSection.updateDataCardTitle} size="compact">
          <AnnualReportDetailForm detail={detail} onSave={onDetailSave} onDirtyChange={onDirtyChange} submitRef={submitRef} />
        </Card>
      </div>

      {/* P&L collapsible */}
      <Card size="compact" disablePadding className="shadow-sm">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setPlExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 rounded-none"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <span>{ANNUAL_REPORTS_MESSAGES.overviewSection.plSummaryTitle}</span>
          </div>
          {plExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </Button>
        {plExpanded && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-4">
            <AnnualPLSummary reportId={report.id} clientId={clientId} />
          </div>
        )}
      </Card>
    </div>
  )
}

AnnualReportOverviewTab.displayName = 'AnnualReportOverviewTab'
