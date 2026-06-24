import { DataTable, type Column } from "../../../components/ui/table/DataTable";
import { formatClientOfficeId, formatPercent } from "../../../utils/utils";
import type { AdvancePaymentReportItem, AdvancePaymentReportResponse } from "../api";
import { formatILS, toReportNumber } from "../utils";
import { REPORTS_MESSAGES } from "../messages";

interface Props {
  data: AdvancePaymentReportResponse;
}

const getClientNumberLabel = (r: AdvancePaymentReportItem) => {
  const number = r.office_client_number ?? r.client_record_id;
  return REPORTS_MESSAGES.advances.clientNumber(formatClientOfficeId(number));
};

const columns: Column<AdvancePaymentReportItem>[] = [
  {
    key: "client_name",
    header: REPORTS_MESSAGES.common.client,
    render: (r) => (
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900">{r.client_name}</div>
        <div className="text-xs text-gray-500">{getClientNumberLabel(r)}</div>
      </div>
    ),
  },
  {
    key: "total_expected",
    header: REPORTS_MESSAGES.advances.expected,
    render: (r) => (
      <span className="text-sm text-gray-700">{formatILS(r.total_expected)}</span>
    ),
  },
  {
    key: "total_paid",
    header: REPORTS_MESSAGES.advances.paid,
    render: (r) => (
      <span className="text-sm text-positive-700">{formatILS(r.total_paid)}</span>
    ),
  },
  {
    key: "gap",
    header: REPORTS_MESSAGES.advances.gap,
    render: (r) => (
      <span className={`text-sm font-medium ${toReportNumber(r.gap) > 0 ? "text-negative-600" : "text-gray-500"}`}>
        {formatILS(r.gap)}
      </span>
    ),
  },
  {
    key: "overdue_count",
    header: REPORTS_MESSAGES.advances.overdueCharges,
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
      emptyMessage={REPORTS_MESSAGES.advances.empty}
    />
    {data.items.length > 0 && (
      <div className="flex items-center gap-6 px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm font-medium text-gray-700">
        <span>{REPORTS_MESSAGES.advances.totalExpected(formatILS(data.total_expected))}</span>
        <span className="text-positive-700">{REPORTS_MESSAGES.advances.totalPaid(formatILS(data.total_paid))}</span>
        <span className={toReportNumber(data.total_gap) > 0 ? "text-negative-600" : "text-gray-500"}>
          {REPORTS_MESSAGES.advances.totalGap(formatILS(data.total_gap))}
        </span>
        <span className="mr-auto text-primary-700">
          {REPORTS_MESSAGES.advances.collectionRate(formatPercent(data.collection_rate))}
        </span>
      </div>
    )}
  </div>
);
