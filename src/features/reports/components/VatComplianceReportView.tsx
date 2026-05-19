import { type VatComplianceItem, type StalePendingItem } from "../api";
import { useVatComplianceReport } from "../hooks/useVatComplianceReport";
import { PageHeader } from "../../../components/layout/PageHeader";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { Badge } from "../../../components/ui/primitives/Badge";
import { Select } from "../../../components/ui/inputs/Select";
import { getOperationalYearOptions } from "@/constants/periodOptions.constants";
import { getVatTypeLabel } from "@/features/clients";

const complianceBadgeVariant = (rate: number) => {
  if (rate >= 80) return "success" as const;
  if (rate >= 50) return "warning" as const;
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

const ComplianceTable = ({ items, year }: { items: VatComplianceItem[]; year?: number }) => {
  if (items.length === 0) return <p className="text-sm text-gray-500">אין נתונים לשנה זו.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 w-full">
      <table className="w-full divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-right">
          <tr>
            {["לקוח", "תקופות צפויות", "הוגשו", "פתוחות", "בזמן", "באיחור", "ציות"].map((h) => (
              <th key={h} className="px-4 py-3 font-medium text-gray-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {items.map((item) => {
            const disambiguation = getComplianceDisambiguation(item, year);
            return (
              <tr
                key={item.grouping_key ?? `${item.client_record_id}-${disambiguation ?? "summary"}`}
                className="hover:bg-gray-50"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="block font-semibold text-gray-900">{item.client_name}</span>
                  {disambiguation && (
                    <span className="block text-xs font-medium text-gray-500">{disambiguation}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">{item.periods_expected}</td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">{item.periods_filed}</td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">{item.periods_open}</td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">{item.on_time_count}</td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">{item.late_count}</td>
                <td className="px-4 py-3">
                  <Badge variant={complianceBadgeVariant(item.compliance_rate)}>
                    {item.compliance_rate.toFixed(1)}%
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const StalePendingTable = ({ items }: { items: StalePendingItem[] }) => {
  if (items.length === 0) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-negative-700">
        ממתין לחומרים מעל 30 יום ({items.length})
      </h3>
      <div className="overflow-x-auto rounded-lg border border-negative-200">
        <table className="min-w-full divide-y divide-negative-100 text-sm">
          <thead className="bg-negative-50 text-right">
            <tr>
              {["לקוח", "תקופה", "ימים ממתין"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium text-negative-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-negative-50 bg-white">
            {items.map((item) => (
              <tr key={`${item.client_record_id}-${item.period}`} className="hover:bg-negative-50">
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{item.client_name}</td>
                <td className="px-4 py-3 text-gray-700 tabular-nums">{item.period}</td>
                <td className="px-4 py-3">
                  <Badge variant="error">{item.days_pending} ימים</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const VatComplianceReportView: React.FC = () => {
  const { year, setYear, data, isLoading, error } = useVatComplianceReport();

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
          <StalePendingTable items={data.stale_pending} />
        </div>
      )}
    </PageStateGuard>
  );
};

VatComplianceReportView.displayName = "VatComplianceReportView";
