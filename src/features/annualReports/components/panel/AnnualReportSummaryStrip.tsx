import { cn } from '@/utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { Card } from '../../../../components/ui/primitives/Card'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'
import { getReportSummaryItems } from '../../utils/reportSummaryHelpers'
import type { AnnualReportFull } from '../../api'

interface Props {
  report: AnnualReportFull
}

/**
 * Compact financial summary for the annual report overview — a single row of
 * label/value pairs (הכנסות · הוצאות · רווח/הפסד · מס · יתרה) on the shared
 * DefinitionList primitive, replacing the tall dashboard-style stat cards.
 */
export const AnnualReportSummaryStrip: React.FC<Props> = ({ report }) => (
  <Card size="compact" className="shadow-sm">
    <DefinitionList
      columns={5}
      className="text-center"
      items={getReportSummaryItems(report).map((item) => ({
        label: item.label,
        value: <span className={cn('font-bold tabular-nums', semanticMonoToneClasses[item.tone])}>{item.value}</span>,
      }))}
    />
  </Card>
)

AnnualReportSummaryStrip.displayName = 'AnnualReportSummaryStrip'
