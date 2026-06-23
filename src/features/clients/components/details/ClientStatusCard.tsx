import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Receipt, CreditCard, TrendingUp, FolderOpen, FileCheck } from 'lucide-react'
import { Select } from '@/components/ui/inputs/Select'
import { clientsApi, clientsQK } from '../../api'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { vatReportsApi, vatReportsQK } from '@/features/vatReports'
import { useFirstBusinessId } from '../../hooks/useFirstBusinessId'
import { formatShekelAmount, formatDate } from '@/utils/utils'
import { ActionSurfaceButton, ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
interface Props {
  clientId: number
}

interface TileProps {
  icon: React.ReactNode
  title: string
  primary: string
  secondary: string
  to?: string
  disabled?: boolean
}

const Tile: React.FC<TileProps> = ({ icon, title, primary, secondary, to, disabled }) => {
  const body = (
    <>
      <div className="shrink-0 text-gray-400">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-gray-500">{title}</p>
        <p className="truncate text-sm font-semibold leading-tight text-gray-900">{primary}</p>
        <p className="truncate text-xs text-gray-500">{secondary}</p>
      </div>
    </>
  )

  // Navigation tiles render as a real link; disabled tiles stay non-interactive.
  return to && !disabled ? (
    <ActionSurfaceLink variant="compact" to={to}>
      {body}
    </ActionSurfaceLink>
  ) : (
    <ActionSurfaceButton variant="compact" disabled>
      {body}
    </ActionSurfaceButton>
  )
}

const CURRENT_YEAR = new Date().getFullYear()

export const ClientStatusCard: React.FC<Props> = ({ clientId }) => {
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)
  const { id: firstBusinessId, isLoading: isBusinessLoading } = useFirstBusinessId(clientId)

  const { data: vatSummary, isLoading: isVatLoading } = useQuery({
    queryKey: vatReportsQK.clientSummary(clientId),
    queryFn: () => vatReportsApi.getClientSummary(clientId),
    enabled: clientId > 0,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
  })

  const { data, isLoading: isStatusLoading } = useQuery({
    queryKey: clientsQK.statusCard(clientId, selectedYear),
    queryFn: () => clientsApi.getStatusCard(clientId, selectedYear),
    enabled: clientId > 0,
    staleTime: QUERY_STALE_TIME.default,
    retry: 1,
  })

  const isLoading = isBusinessLoading || isStatusLoading || isVatLoading
  const vatYear = vatSummary?.annual?.find((entry) => entry.year === selectedYear)
  const yearOptions = useMemo(() => {
    const years = new Set<number>()
    vatSummary?.annual?.forEach((entry) => {
      if (
        entry.periods_count > 0 ||
        entry.filed_count > 0 ||
        Number(entry.total_output_vat) !== 0 ||
        Number(entry.total_input_vat) !== 0 ||
        Number(entry.net_vat) !== 0
      ) {
        years.add(entry.year)
      }
    })
    years.add(data?.year ?? CURRENT_YEAR)
    return Array.from(years).sort((a, b) => b - a)
  }, [data?.year, vatSummary?.annual])
  const vatPrimary = vatYear ? formatShekelAmount(vatYear.net_vat) : '—'
  const vatStatus = vatYear
    ? vatYear.periods_count === 0
      ? 'אין דיווחים'
      : `${vatYear.filed_count}/${vatYear.periods_count} דווחו`
    : 'אין דיווחים'

  const yearSelector = (
    <Select
      fieldClassName="w-[7rem]"
      options={yearOptions.map((y) => ({ value: String(y), label: String(y) }))}
      value={String(selectedYear)}
      onChange={(e) => setSelectedYear(Number(e.target.value))}
      className="px-2"
    />
  )

  if (isLoading) {
    return (
      <section className="w-full max-w-4xl space-y-1.5 rounded-lg border border-gray-200/80 bg-white px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-gray-900">סטטוס לקוח</h3>
        </div>
        <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} width="w-full" height="h-10" rounded="md" />
          ))}
        </div>
      </section>
    )
  }

  if (!data) return null

  const { annual_report, charges, advance_payments, binders, documents, year } = data

  const arStatus = annual_report.status
    ? annual_report.form_type
      ? `טופס ${annual_report.form_type}`
      : annual_report.status
    : 'אין דוח'

  const arSecondary = annual_report.filing_deadline
    ? `הגשה: ${formatDate(annual_report.filing_deadline)}`
    : annual_report.refund_due != null
      ? `החזר: ${formatShekelAmount(annual_report.refund_due)}`
      : annual_report.tax_due != null
        ? `תשלום: ${formatShekelAmount(annual_report.tax_due)}`
        : '—'

  return (
    <section className="w-full max-w-4xl space-y-1.5 rounded-lg border border-gray-200/80 bg-white px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">סטטוס לקוח — {year}</h3>
        {yearSelector}
      </div>
      <div className="grid grid-cols-2 gap-0.5 md:grid-cols-3">
        <Tile
          icon={<Receipt size={14} />}
          title='מע"מ (לקוח)'
          primary={vatPrimary}
          secondary={vatStatus}
          to={CLIENT_ROUTES.vat(clientId)}
        />
        <Tile
          icon={<FileText size={14} />}
          title="דוח שנתי"
          primary={arStatus}
          secondary={arSecondary}
          to={CLIENT_ROUTES.annualReports(clientId)}
        />
        <Tile
          icon={<CreditCard size={14} />}
          title="חיובים פתוחים"
          primary={formatShekelAmount(charges.total_outstanding)}
          secondary={`${charges.unpaid_count} חיובים`}
          to={`/charges?client_record_id=${clientId}`}
        />
        <Tile
          icon={<TrendingUp size={14} />}
          title="מקדמות"
          primary={formatShekelAmount(advance_payments.total_paid)}
          secondary={`${advance_payments.count} תשלומים`}
          to={CLIENT_ROUTES.advancePayments(clientId)}
        />
        <Tile
          icon={<FolderOpen size={14} />}
          title="קלסרים"
          primary={firstBusinessId == null ? '—' : `${binders.active_count} פעילים`}
          secondary={firstBusinessId == null ? 'אין עסקים רשומים' : `${binders.in_office_count} במשרד`}
          to={`/binders?client_record_id=${clientId}`}
          disabled={firstBusinessId == null}
        />
        <Tile
          icon={<FileCheck size={14} />}
          title="מסמכים"
          primary={firstBusinessId == null ? '—' : `${documents.present_count}/${documents.total_count}`}
          secondary={firstBusinessId == null ? 'אין עסקים רשומים' : 'מסמכים קיימים'}
          to={CLIENT_ROUTES.documents(clientId)}
          disabled={firstBusinessId == null}
        />
      </div>
    </section>
  )
}
