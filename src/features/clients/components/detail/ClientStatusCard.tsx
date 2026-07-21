import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Receipt, CreditCard, TrendingUp, FolderOpen, FileCheck, ListTodo } from 'lucide-react'
import { Select } from '@/components/ui/inputs/Select'
import { clientsApi, clientsQK } from '../../api'
import { CLIENT_ROUTES } from '../../api/endpoints'
import { vatReportsApi, vatReportsQK } from '@/features/vatReports'
import { useFirstBusinessId } from '../../hooks/useFirstBusinessId'
import { formatShekelAmount, formatDate } from '@/utils/utils'
import { ActionSurfaceButton, ActionSurfaceLink } from '@/components/ui/primitives/ActionSurface'
import { Card } from '@/components/ui/primitives/Card'
import { SkeletonBlock } from '@/components/ui/primitives/SkeletonBlock'
import { QUERY_STALE_TIME } from '@/lib/queryDefaults'
import { CLIENTS_MESSAGES } from '../../messages'
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
      ? CLIENTS_MESSAGES.statusCard.noReports
      : CLIENTS_MESSAGES.statusCard.reportedRatio(vatYear.filed_count, vatYear.periods_count)
    : CLIENTS_MESSAGES.statusCard.noReports

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
      <Card title={CLIENTS_MESSAGES.statusCard.title} size="compact" className="shadow-none">
        <div className="grid grid-cols-2 gap-1 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} width="w-full" height="h-10" rounded="md" />
          ))}
        </div>
      </Card>
    )
  }

  if (!data) return null

  const { annual_report, charges, advance_payments, binders, documents, tasks, year } = data

  const arStatus = annual_report.status
    ? annual_report.form_type
      ? CLIENTS_MESSAGES.statusCard.annualReportForm(annual_report.form_type)
      : annual_report.status
    : CLIENTS_MESSAGES.statusCard.noAnnualReport

  const arSecondary = annual_report.filing_deadline
    ? CLIENTS_MESSAGES.statusCard.filingDeadline(formatDate(annual_report.filing_deadline))
    : annual_report.refund_due != null
      ? CLIENTS_MESSAGES.statusCard.refundDue(formatShekelAmount(annual_report.refund_due))
      : annual_report.tax_due != null
        ? CLIENTS_MESSAGES.statusCard.taxDue(formatShekelAmount(annual_report.tax_due))
        : '—'

  return (
    <Card title={CLIENTS_MESSAGES.statusCard.titleWithYear(year)} actions={yearSelector} size="compact" className="shadow-none">
      <div className="grid grid-cols-2 gap-0.5 lg:grid-cols-4">
        <Tile
          icon={<Receipt size={14} />}
          title={CLIENTS_MESSAGES.statusCard.vatTitle}
          primary={vatPrimary}
          secondary={vatStatus}
          to={CLIENT_ROUTES.vat(clientId)}
        />
        <Tile
          icon={<FileText size={14} />}
          title={CLIENTS_MESSAGES.statusCard.annualReportTitle}
          primary={arStatus}
          secondary={arSecondary}
          to={CLIENT_ROUTES.annualReports(clientId)}
        />
        <Tile
          icon={<CreditCard size={14} />}
          title={CLIENTS_MESSAGES.statusCard.openChargesTitle}
          primary={formatShekelAmount(charges.total_outstanding)}
          secondary={CLIENTS_MESSAGES.statusCard.chargesCount(charges.unpaid_count)}
          to={`/charges?client_record_id=${clientId}`}
        />
        <Tile
          icon={<TrendingUp size={14} />}
          title={CLIENTS_MESSAGES.statusCard.advancesTitle}
          primary={formatShekelAmount(advance_payments.total_paid)}
          secondary={CLIENTS_MESSAGES.statusCard.paymentsCount(advance_payments.count)}
          to={CLIENT_ROUTES.advancePayments(clientId)}
        />
        <Tile
          icon={<FolderOpen size={14} />}
          title={CLIENTS_MESSAGES.statusCard.bindersTitle}
          primary={firstBusinessId == null ? '—' : CLIENTS_MESSAGES.statusCard.bindersActive(binders.active_count)}
          secondary={
            firstBusinessId == null
              ? CLIENTS_MESSAGES.statusCard.noBusinesses
              : CLIENTS_MESSAGES.statusCard.bindersInOffice(binders.in_office_count)
          }
          to={`/binders?client_record_id=${clientId}`}
          disabled={firstBusinessId == null}
        />
        <Tile
          icon={<FileCheck size={14} />}
          title={CLIENTS_MESSAGES.statusCard.documentsTitle}
          primary={firstBusinessId == null ? '—' : `${documents.present_count}/${documents.total_count}`}
          secondary={
            firstBusinessId == null ? CLIENTS_MESSAGES.statusCard.noBusinesses : CLIENTS_MESSAGES.statusCard.documentsExist
          }
          to={CLIENT_ROUTES.documents(clientId)}
          disabled={firstBusinessId == null}
        />
        <Tile
          icon={<ListTodo size={14} />}
          title={CLIENTS_MESSAGES.statusCard.tasksTitle}
          primary={CLIENTS_MESSAGES.statusCard.openTasks(tasks.open_count)}
          secondary={CLIENTS_MESSAGES.statusCard.tasksSecondary}
          to={CLIENT_ROUTES.tasks(clientId)}
        />
      </div>
    </Card>
  )
}
