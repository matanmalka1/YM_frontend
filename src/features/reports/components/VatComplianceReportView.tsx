import { type VatComplianceItem, type StalePendingItem } from "../api";
import { useVatComplianceReport } from "../hooks/useVatComplianceReport";
import { PageHeader } from "../../../components/layout/PageHeader";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { Badge } from "../../../components/ui/primitives/Badge";
import { Select } from "../../../components/ui/inputs/Select";
import { DataTable, type Column } from "@/components/ui/table/DataTable";
import { PaginationCard } from "@/components/ui/table/PaginationCard";
import { getOperationalYearOptions } from "@/constants/periodOptions.constants";
import { getVatTypeLabel } from "@/features/clients";

const complianceBadgeVariant = (rate: string) => {
  const numericRate = Number(rate);
  if (numericRate >= 80) return "success" as const;
  if (numericRate >= 50) return "warning" as const;
  return "error" as const;
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
    header: "לקוח",
    align: "right",
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
  { key: "expected", header: "תקופות צפויות", align: "right", render: (item) => numericCell(item.periods_expected) },
  { key: "filed", header: "הוגשו", align: "right", render: (item) => numericCell(item.periods_filed) },
  { key: "open", header: "פתוחות", align: "right", render: (item) => numericCell(item.periods_open) },
  { key: "onTime", header: "בזמן", align: "right", render: (item) => numericCell(item.on_time_count) },
  { key: "late", header: "באיחור", align: "right", render: (item) => numericCell(item.late_count) },
  {
    key: "rate",
    header: "ציות",
    align: "right",
    render: (item) => (
      <Badge variant={complianceBadgeVariant(item.compliance_rate)}>
        {Number(item.compliance_rate).toFixed(1)}%
      </Badge>
    ),
  },
];

const ComplianceTable = ({ items, year }: { items: VatComplianceItem[]; year?: number }) => {
  if (items.length === 0) return <p className="text-sm text-gray-500">אין נתונים לשנה זו.</p>;
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
    header: "לקוח",
    align: "right",
    render: (item) => <span className="font-semibold text-gray-900">{item.client_name}</span>,
  },
  {
    key: "period",
    header: "תקופה",
    align: "right",
    render: (item) => <span className="text-gray-700 tabular-nums">{item.period}</span>,
  },
  {
    key: "days",
    header: "ימים ממתין",
    align: "right",
    render: (item) => <Badge variant="error">{item.days_pending} ימים</Badge>,
  },
];

const StalePendingTable = ({ items }: { items: StalePendingItem[] }) => {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-negative-700">
        ממתין לחומרים מעל 30 יום ({items.length})
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

  const description = data ? `${data.total_clients} לקוחות` : "";

  const header = (
    <PageHeader
      title='דוח ציות מע"מ'
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
    <PageStateGuard isLoading={isLoading} error={error?.message ?? null} header={header} loadingMessage="טוען דוח...">
      {data && (
        <div className="space-y-6">
          <ComplianceTable items={data.items} year={data.year} />
          {totalPages > 1 && (
            <PaginationCard page={page} totalPages={totalPages} total={data.total} onPageChange={setPage} />
          )}
          <StalePendingTable items={data.stale_pending} />
        </div>
      )}
    </PageStateGuard>
  );
};

VatComplianceReportView.displayName = "VatComplianceReportView";
