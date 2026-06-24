import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
import { annualReportTaxApi, annualReportsQK } from '../../api'
import { cn, formatPercent } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { ProgressBar } from '@/components/ui/primitives/ProgressBar'
import { clampPercent } from '../../utils/panelHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface ReadinessCheckPanelProps {
  reportId: number
}

export const ReadinessCheckPanel: React.FC<ReadinessCheckPanelProps> = ({ reportId }) => {
  const { data, isLoading } = useQuery({
    queryKey: annualReportsQK.readiness(reportId),
    queryFn: () => annualReportTaxApi.getReadiness(reportId),
    enabled: !!reportId,
  })

  if (isLoading) return <p className="text-sm text-gray-400 py-2">{ANNUAL_REPORTS_MESSAGES.readinessCheck.loading}</p>
  if (!data) return null

  const completion = clampPercent(data.completion_pct)

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex items-center gap-2 text-sm font-medium',
          data.is_ready ? semanticMonoToneClasses.positive : semanticMonoToneClasses.negative,
        )}
      >
        {data.is_ready ? (
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{ANNUAL_REPORTS_MESSAGES.readinessCheck.ready}</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{ANNUAL_REPORTS_MESSAGES.readinessCheck.notReady(data.issues.length)}</span>
          </>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{ANNUAL_REPORTS_MESSAGES.readinessCheck.completionLabel}</span>
          <span>{formatPercent(completion)}</span>
        </div>
        <ProgressBar value={completion} tone={data.is_ready ? 'positive' : 'warning'} />
      </div>

      {data.issues.length > 0 && (
        <ul className="space-y-1">
          {data.issues.map((issue) => (
            <li key={issue} className="flex items-start gap-1.5 text-sm text-negative-700">
              <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-negative-400" />
              <span>{issue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
