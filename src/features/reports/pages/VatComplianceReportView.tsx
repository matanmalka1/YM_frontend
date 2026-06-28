import { GLOBAL_UI_MESSAGES } from '@/messages'
import { type VatComplianceItem, type StalePendingItem } from "../api";
import { useVatComplianceReport } from "../hooks/useVatComplianceReport";
import { PageHeader } from "../../../components/layout/PageHeader";
import { PageContent } from "@/components/layout/PageContent";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { Badge } from "../../../components/ui/primitives/Badge";
import { Select } from "../../../components/ui/inputs/Select";
import { DataTable, PaginationCard, type Column } from '@/components/ui/table';
import { getOperationalYearOptions } from "@/constants/periodOptions.constants";
import { getVatTypeLabel } from "@/features/clients";
import { formatPercent } from "@/utils/utils";
import { REPORTS_MESSAGES } from "../messages";

const complianceBadgeVariant = (rate: string) => {
  const numericRate = Number(rate);
  if (numericRate >= 80) return "positive" as const;
  if (numericRate >= 50) return "warning" as const;
  return "negative" as const;
};

const getComplianceDisambiguation = (item: VatComplianceItem, reportYear?: number) => {
  const year = item.year ?? reportYear;
  const frequency = item.reporting_frequency ?? item.period_type;
  const frequencyLabel = frequency ? getVatTypeLabel(frequency) : item.grouping_key;
  if (!year && !frequencyLabel) return null;
  if (!year) return frequencyLabel;
  if (!frequencyLabel) return String(year);
  return `${year}: ${frequencyLabel}`;
};

const numericCell = (value: number) => <span className="text-gray-700 tabular-nums">{value}</span>;

const buildComplianceColumns = (year?: number): Column<VatComplianceItem>[] => [
  {
    key: "client",
    header: GLOBAL_UI_MESSAGES.common.client,
    render: (item) => {
      const disambiguation = getComplianceDisambiguation(item, year);
      return (
        <>
          <span className="block font-semibold text-gray-900">{item.client_name}</span>
          {disambiguation && <span className="block text-xs font-medium text-gray-500">{disambiguation}</span>}
        </>
      );
    },
  },
  { key: "expected", header: REPORTS_MESSAGES.vatCompliance.expectedPeriods, render: (item) => numericCell(item.periods_expected) },
  { key: "filed", header: REPORTS_MESSAGES.vatCompliance.filed, render: (item) => numericCell(item.periods_filed) },
  { key: "open", header: REPORTS_MESSAGES.vatCompliance.open, render: (item) => numericCell(item.periods_open) },
  { key: "onTime", header: REPORTS_MESSAGES.vatCompliance.onTime, render: (item) => numericCell(item.on_time_count) },
  { key: "late", header: REPORTS_MESSAGES.vatCompliance.late, render: (item) => numericCell(item.late_count) },
  {
    key: "rate",
    header: REPORTS_MESSAGES.vatCompliance.compliance,
    render: (item) => (
      <Badge variant={complianceBadgeVariant(item.compliance_rate)}>
        {formatPercent(item.compliance_rate)}
      </Badge>
    ),
  },
];

const ComplianceTable = ({ items, year }: { items: VatComplianceItem[]; year?: number }) => {
  if (items.length === 0) return <p className="text-sm text-gray-500">{REPORTS_MESSAGES.vatCompliance.noYearData}</p>;
  return (
    <DataTable
      data={items}
      columns={buildComplianceColumns(year)}
      getRowKey={(item) =>
        item.grouping_key ?? `${item.client_record_id}-${getComplianceDisambiguation(item, year) ?? "summary"}`
      }
    />
  );
};

const STALE_PENDING_COLUMNS: Column<StalePendingItem>[] = [
  {
    key: "client",
    header: GLOBAL_UI_MESSAGES.common.client,
    render: (item) => <span className="font-semibold text-gray-900">{item.client_name}</span>,
  },
  {
    key: "period",
    header: REPORTS_MESSAGES.vatCompliance.period,
    render: (item) => <span className="text-gray-700 tabular-nums">{item.period}</span>,
  },
  {
    key: "days",
    header: REPORTS_MESSAGES.vatCompliance.pendingDays,
    render: (item) => <Badge variant="negative">{REPORTS_MESSAGES.common.days(item.days_pending)}</Badge>,
  },
];

const StalePendingTable = ({ items }: { items: StalePendingItem[] }) => {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-negative-700">
        {REPORTS_MESSAGES.vatCompliance.pendingOverThirty(items.length)}
      </h3>
      <DataTable
        data={items}
        columns={STALE_PENDING_COLUMNS}
        getRowKey={(item) => `${item.client_record_id}-${item.period}`}
      />
    </div>
  );
};

export const VatComplianceReportView: React.FC = () => {
  const { year, setYear, page, setPage, totalPages, data, isLoading, error } = useVatComplianceReport();

  const description = data ? REPORTS_MESSAGES.vatCompliance.description(data.total_clients) : "";

  const header = (
    <PageHeader
      title={REPORTS_MESSAGES.vatCompliance.title}
      description={description}
      actions={
        <Select
          value={String(year)}
          onChange={(e) => setYear(Number(e.target.value))}
          options={getOperationalYearOptions()}
          fieldClassName="w-28"
        />
      }
    />
  );

  return (
    <PageStateGuard isLoading={isLoading} error={error?.message ?? null} header={header} loadingMessage={REPORTS_MESSAGES.common.loadingReport}>
      {data && (
        <PageContent>
          <ComplianceTable items={data.items} year={data.year} />
          {totalPages > 1 && (
            <PaginationCard page={page} totalPages={totalPages} total={data.total} onPageChange={setPage} />
          )}
          <StalePendingTable items={data.stale_pending} />
        </PageContent>
      )}
    </PageStateGuard>
  );
};

VatComplianceReportView.displayName = "VatComplianceReportView";
