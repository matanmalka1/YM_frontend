import type { MutableRefObject } from 'react'
import type { SectionKey } from '../../types'
import type { AnnualReportDetailUpdatePayload, AnnualReportFull, AnnualReportScheduleKey } from '../../api'
import { AnnualReportOverviewTab } from './AnnualReportOverviewTab'
import { IncomeExpenseTab } from '../financials/IncomeExpenseTab'
import { TaxCalculationTab } from '../tax/TaxCalculationTab'
import { DeductionsTab } from '../tax/DeductionsTab'
import { AnnualReportAnnexesTab } from '../annex/AnnualReportAnnexesTab'
import { AnnualReportTimelineTab } from './AnnualReportTimelineTab'

interface AnnualReportSectionContentProps {
  reportId: number
  activeSection: SectionKey
  report: AnnualReportFull
  updateDetail: (payload: AnnualReportDetailUpdatePayload) => void
  completeSchedule: (schedule: AnnualReportScheduleKey) => void
  addSchedule: (schedule: AnnualReportScheduleKey, notes?: string) => void
  isCompletingSchedule: boolean
  isAddingSchedule: boolean
  setIsDirty: (v: boolean) => void
  submitRef: MutableRefObject<(() => void) | null>
}

export const AnnualReportSectionContent = ({
  reportId,
  activeSection,
  report,
  updateDetail,
  completeSchedule,
  addSchedule,
  isCompletingSchedule,
  isAddingSchedule,
  setIsDirty,
  submitRef,
}: AnnualReportSectionContentProps) => {
  switch (activeSection) {
    case 'overview':
      return (
        <AnnualReportOverviewTab
          report={report}
          detail={report}
          onDetailSave={updateDetail}
          clientId={report.client_record_id}
          onDirtyChange={setIsDirty}
          submitRef={submitRef}
        />
      )
    case 'financials':
      return <IncomeExpenseTab reportId={reportId} clientRecordId={report.client_record_id} />
    case 'tax':
      return <TaxCalculationTab reportId={reportId} />
    case 'deductions':
      return <DeductionsTab reportId={reportId} />
    case 'annex':
      return (
        <AnnualReportAnnexesTab
          reportId={report.id}
          schedules={report.schedules ?? []}
          onScheduleComplete={completeSchedule}
          onScheduleAdd={addSchedule}
          isScheduleLoading={isCompletingSchedule}
          isScheduleAdding={isAddingSchedule}
        />
      )
    case 'timeline':
      return <AnnualReportTimelineTab report={report} />
  }
}

AnnualReportSectionContent.displayName = 'AnnualReportSectionContent'
