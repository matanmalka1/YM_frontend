import { PageHeader } from '../../../components/layout/PageHeader'
import { PageStateGuard } from '../../../components/ui/layout/PageStateGuard'
import { AnnualReportStatusTable } from '../components/AnnualReportStatusTable'
import { useAnnualReportStatusReport } from '../hooks/useAnnualReportStatusReport'
import { REPORTS_MESSAGES } from '../messages'
import { Select } from '@/components/ui/inputs/Select'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'

export const AnnualReportStatusView = () => {
  const { taxYear, setTaxYear, data, isLoading, error } = useAnnualReportStatusReport()

  const header = (
    <PageHeader
      title={REPORTS_MESSAGES.annualStatus.title}
      description={data ? REPORTS_MESSAGES.annualStatus.description(data.total, taxYear) : ''}
      actions={
        <Select
          value={String(taxYear)}
          onChange={(event) => setTaxYear(Number(event.target.value))}
          options={getOperationalYearOptions()}
          fieldClassName="w-28"
        />
      }
    />
  )

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage={REPORTS_MESSAGES.common.loadingReport}>
      {data && <AnnualReportStatusTable statuses={data.statuses} />}
    </PageStateGuard>
  )
}

AnnualReportStatusView.displayName = 'AnnualReportStatusView'
