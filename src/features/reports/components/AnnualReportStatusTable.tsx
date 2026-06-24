import { GroupSection } from "../../../components/ui/primitives/GroupSection";
import { Badge } from "../../../components/ui/primitives/Badge";
import { DataTable, type Column } from "../../../components/ui/table/DataTable";
import type { AnnualReportClientEntry, AnnualReportStatusGroup } from "../api";
import {
  getStatusLabel,
  getStatusVariant,
} from "@/features/annualReports";
import { formatDate } from "../../../utils/utils";
import { REPORTS_MESSAGES } from "../messages";

interface Props {
  statuses: AnnualReportStatusGroup[];
}

const clientColumns: Column<AnnualReportClientEntry>[] = [
  {
    key: "client_name",
    header: REPORTS_MESSAGES.common.client,
    render: (r) => (
      <span className="text-sm font-medium text-gray-900">{r.client_name}</span>
    ),
  },
  {
    key: "form_type",
    header: REPORTS_MESSAGES.annualStatus.form,
    render: (r) => (
      <span className="text-sm text-gray-500">{r.form_type ?? "—"}</span>
    ),
  },
  {
    key: "filing_deadline",
    header: REPORTS_MESSAGES.annualStatus.filingDeadline,
    render: (r) => (
      <span className="text-sm text-gray-500">
        {r.filing_deadline ? formatDate(r.filing_deadline) : "—"}
      </span>
    ),
  },
  {
    key: "days_until_deadline",
    header: REPORTS_MESSAGES.annualStatus.daysUntilDeadline,
    render: (r) => {
      if (r.days_until_deadline === null)
        return <span className="text-sm text-gray-400">—</span>;
      const d = r.days_until_deadline;
      const cls =
        d < 0
          ? "text-negative-600 font-semibold"
          : d <= 14
            ? "text-warning-600 font-semibold"
            : "text-gray-600";
      return (
        <span className={`text-sm ${cls}`}>
          {d < 0 ? REPORTS_MESSAGES.annualStatus.overdueDays(Math.abs(d)) : REPORTS_MESSAGES.common.days(d)}
        </span>
      );
    },
  },
];

export const AnnualReportStatusTable: React.FC<Props> = ({ statuses }) => (
  <div className="space-y-4">
    {statuses.map((group) => (
      <GroupSection
        key={group.status}
        label={<Badge variant={getStatusVariant(group.status)}>{getStatusLabel(group.status)}</Badge>}
        count={group.count}
        countLabel={REPORTS_MESSAGES.common.clients}
      >
        <DataTable
          data={group.clients}
          columns={clientColumns}
          getRowKey={(r) => r.client_record_id}
          emptyMessage={REPORTS_MESSAGES.annualStatus.emptyStatus}
        />
      </GroupSection>
    ))}
  </div>
);
