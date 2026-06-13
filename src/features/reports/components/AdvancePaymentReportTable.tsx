import { DataTable, type Column } from "../../../components/ui/table/DataTable";
import { formatClientOfficeId } from "../../../utils/utils";
import type { AdvancePaymentReportItem, AdvancePaymentReportResponse } from "../api";
import { formatILS, toReportNumber } from "../utils";

interface Props {
  data: AdvancePaymentReportResponse;
}

const getClientNumberLabel = (r: AdvancePaymentReportItem) => {
  const number = r.office_client_number ?? r.client_record_id;
  return `לקוח ${formatClientOfficeId(number)}`;
};

const columns: Column<AdvancePaymentReportItem>[] = [
  {
    key: "client_name",
    header: "לקוח",
    render: (r) => (
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900">{r.client_name}</div>
        <div className="text-xs text-gray-500">{getClientNumberLabel(r)}</div>
      </div>
    ),
  },
  {
    key: "total_expected",
    header: "צפוי",
    render: (r) => (
      <span className="text-sm text-gray-700">{formatILS(r.total_expected)}</span>
    ),
  },
  {
    key: "total_paid",
    header: "שולם",
    render: (r) => (
      <span className="text-sm text-positive-700">{formatILS(r.total_paid)}</span>
    ),
  },
  {
    key: "gap",
    header: "פער",
    render: (r) => (
      <span className={`text-sm font-medium ${toReportNumber(r.gap) > 0 ? "text-negative-600" : "text-gray-500"}`}>
        {formatILS(r.gap)}
      </span>
    ),
  },
  {
    key: "overdue_count",
    header: "חיובים באיחור",
    render: (r) => (
      <span className={`text-sm ${r.overdue_count > 0 ? "text-negative-600 font-semibold" : "text-gray-400"}`}>
        {r.overdue_count}
      </span>
    ),
  },
];

export const AdvancePaymentReportTable: React.FC<Props> = ({ data }) => (
  <div className="rounded-xl border border-gray-200 overflow-hidden">
    <DataTable
      data={data.items}
      columns={columns}
      getRowKey={(r) => r.client_record_id}
      emptyMessage="אין נתונים לתצוגה"
    />
    {data.items.length > 0 && (
      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm font-medium text-gray-700">
        <span>סה״כ: {formatILS(data.total_expected)} צפוי</span>
        <span className="text-positive-700">{formatILS(data.total_paid)} שולם</span>
        <span className={toReportNumber(data.total_gap) > 0 ? "text-negative-600" : "text-gray-500"}>
          פער: {formatILS(data.total_gap)}
        </span>
        <span className="mr-auto text-blue-700">
          אחוז גבייה: {Number(data.collection_rate).toFixed(1)}%
        </span>
      </div>
    )}
  </div>
);
