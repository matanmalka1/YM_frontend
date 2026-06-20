import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, XCircle } from 'lucide-react'
import { annualReportTaxApi, annualReportsQK } from '../../api'
import { cn, formatPercent } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { clampPercent } from '../../utils/panelHelpers'

interface ReadinessCheckPanelProps {
  reportId: number
}

export const ReadinessCheckPanel: React.FC<ReadinessCheckPanelProps> = ({ reportId }) => {
  const { data, isLoading } = useQuery({
    queryKey: annualReportsQK.readiness(reportId),
    queryFn: () => annualReportTaxApi.getReadiness(reportId),
    enabled: !!reportId,
  })

  if (isLoading) return <p className="text-sm text-gray-400 py-2">בודק מוכנות...</p>
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
            <span>הדוח מוכן להגשה</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 shrink-0" />
            <span>הדוח אינו מוכן להגשה ({data.issues.length} בעיות)</span>
          </>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>אחוז השלמת מוכנות</span>
          <span>{formatPercent(completion)}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className={cn('h-2 rounded-full transition-all', data.is_ready ? 'bg-positive-500' : 'bg-warning-500')}
            style={{ width: `${completion}%` }}
          />
        </div>
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
