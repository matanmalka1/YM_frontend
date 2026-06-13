import { useQuery } from '@tanstack/react-query'
import { Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { he } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/primitives/Card'
import { Badge } from '@/components/ui/primitives/Badge'
import { Timeline, TimelineEntry } from '@/components/ui/feedback/Timeline'
import { bindersApi, bindersQK } from '../../api'
import {
  ANNUAL_REPORTS_COMPLETE_LIST_PARAMS,
  annualReportsApi,
  annualReportsQK,
  getStatusLabel,
} from '@/features/annualReports'
import { clientsApi, clientsQK } from '@/features/clients'
import { vatReportsApi, vatReportsQK } from '@/features/vatReports'
import { VAT_STATUS_BADGE_VARIANTS } from '@/features/vatReports'
import { staggerDelay } from '@/utils/animation'
import { getBinderTypeLabel } from '../../constants'
import { getVatWorkItemStatusLabel } from '@/features/vatReports'
import type { BinderIntakeMaterialResponse } from '../../types'
import { formatStructuredBinderPeriod, toBinderPeriodValue } from '../../utils'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'

const VatStatusBadge: React.FC<{ material: BinderIntakeMaterialResponse; clientId: number }> = ({
  material,
  clientId,
}) => {
  const navigate = useNavigate()
  const period =
    material.period_year && material.period_month_start && material.period_month_end
      ? toBinderPeriodValue(material.period_year, material.period_month_start, material.period_month_end)
      : null

  const { data: lookup } = useQuery({
    queryKey: vatReportsQK.lookup(clientId, period!),
    queryFn: () => vatReportsApi.lookup(clientId, period!),
    enabled: clientId > 0 && !!period,
    staleTime: QUERY_STALE_TIME.default,
  })

  if (!lookup) return null

  return (
    <Badge
      variant={VAT_STATUS_BADGE_VARIANTS[lookup.status] ?? 'neutral'}
      className="cursor-pointer mr-1"
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        navigate(`/tax/vat/${lookup.id}`)
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        e.stopPropagation()
        navigate(`/tax/vat/${lookup.id}`)
      }}
    >
      {getVatWorkItemStatusLabel(lookup.status)}
    </Badge>
  )
}

interface BinderIntakesSectionProps {
  binderId: number
  clientId: number
  onNavigateToAnnualReport?: () => void
}

export const BinderIntakesSection: React.FC<BinderIntakesSectionProps> = ({
  binderId,
  clientId,
  onNavigateToAnnualReport,
}) => {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: bindersQK.intakes(binderId),
    queryFn: () => bindersApi.getIntakes(binderId),
  })
  const { data: businessesData } = useQuery({
    queryKey: clientsQK.businessesAll(clientId),
    queryFn: () => clientsApi.listAllBusinessesForClient(clientId),
    enabled: clientId > 0,
    staleTime: QUERY_STALE_TIME.default,
  })
  const { data: annualReportsData } = useQuery({
    queryKey: annualReportsQK.forClient(clientId),
    queryFn: () => annualReportsApi.listClientReports(clientId, ANNUAL_REPORTS_COMPLETE_LIST_PARAMS),
    enabled: clientId > 0,
    staleTime: QUERY_STALE_TIME.default,
  })

  const intakes = data?.items ?? []
  const businesses = businessesData?.items ?? []
  const annualReports = annualReportsData ?? []

  if (isLoading) return null

  return (
    <Card title="קליטות חומר" subtitle={intakes.length ? `${intakes.length} קליטות` : undefined}>
      {intakes.length === 0 ? (
        <p className="text-sm text-gray-500">אין קליטות חומר</p>
      ) : (
        <Timeline>
          {[...intakes].reverse().map((intake, index) => (
            <TimelineEntry key={intake.id} animationDelay={staggerDelay(index, 40)}>
              <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {format(parseISO(intake.received_at), 'd MMM yyyy', { locale: he })}
              </div>

              {intake.materials.length > 0 && (
                <div className="mt-1 flex flex-col gap-1">
                  {intake.materials.map((m) => {
                    const period = formatStructuredBinderPeriod(m.period_year, m.period_month_start, m.period_month_end)
                    const businessName =
                      m.business_id != null
                        ? (businesses.find((business) => business.id === m.business_id)?.business_name ??
                          `עסק #${m.business_id}`)
                        : null
                    const annualReport =
                      m.annual_report_id != null
                        ? (annualReports.find((report) => report.id === m.annual_report_id) ?? null)
                        : null
                    return (
                      <div
                        key={m.id}
                        className="flex flex-col gap-0.5 text-xs border-t border-gray-100 pt-1 first:border-0 first:pt-0"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 w-20 shrink-0">סוג חומר</span>
                          <span className="text-gray-700 font-medium">{getBinderTypeLabel(m.material_type)}</span>
                          {m.material_type === 'vat' && m.period_year && m.period_month_start && m.period_month_end && (
                            <VatStatusBadge material={m} clientId={clientId} />
                          )}
                        </div>
                        {businessName && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 w-20 shrink-0">עסק</span>
                            <span className="text-gray-700">{businessName}</span>
                          </div>
                        )}
                        {m.material_type === 'annual_report' && m.annual_report_id != null && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 w-20 shrink-0">דוח שנתי</span>
                            <button
                              type="button"
                              className="text-primary-700 hover:text-primary-800 hover:underline"
                              onClick={() => {
                                onNavigateToAnnualReport?.()
                                navigate(`/tax/reports/${m.annual_report_id}`)
                              }}
                            >
                              {annualReport
                                ? `${annualReport.tax_year} — ${getStatusLabel(annualReport.status)}`
                                : `דוח #${m.annual_report_id}`}
                            </button>
                          </div>
                        )}
                        {period && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 w-20 shrink-0">תקופת דיווח</span>
                            <span className="text-gray-700">{period}</span>
                          </div>
                        )}
                        {!period && m.description && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 w-20 shrink-0">תיאור</span>
                            <span className="text-gray-700">{m.description}</span>
                          </div>
                        )}
                        {intake.received_by_name && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 w-20 shrink-0">נקלט ע״י</span>
                            <span className="text-gray-700">{intake.received_by_name}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {intake.notes && (
                <p className="mt-1.5 text-xs text-gray-600 border-t border-gray-100 pt-1.5">{intake.notes}</p>
              )}
            </TimelineEntry>
          ))}
        </Timeline>
      )}
    </Card>
  )
}

BinderIntakesSection.displayName = 'BinderIntakesSection'
