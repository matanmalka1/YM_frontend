import { GLOBAL_UI_MESSAGES } from '@/messages'
import { GroupSection } from "../../../components/ui/primitives/GroupSection";
import { Badge } from "../../../components/ui/primitives/Badge";
import {
  DataTable,
  dateColumn,
  EmptyCell,
  textColumn,
  type Column,
} from "../../../components/ui/table";
import type { AnnualReportClientEntry, AnnualReportStatusGroup } from "../api";
import {
  getStatusLabel,
  getStatusVariant,
} from "@/features/annualReports";
import { REPORTS_MESSAGES } from "../messages";

interface Props {
  statuses: AnnualReportStatusGroup[];
}

const clientColumns: Column<AnnualReportClientEntry>[] = [
  textColumn({
    key: "client_name",
    header: GLOBAL_UI_MESSAGES.common.client,
    tone: "strong",
    getValue: (r) => r.client_name,
  }),
  textColumn({
    key: "form_type",
    header: REPORTS_MESSAGES.annualStatus.form,
    getValue: (r) => r.form_type,
  }),
  dateColumn({
    key: "filing_deadline",
    header: REPORTS_MESSAGES.annualStatus.filingDeadline,
    getValue: (r) => r.filing_deadline,
  }),
  {
    key: "days_until_deadline",
    header: REPORTS_MESSAGES.annualStatus.daysUntilDeadline,
    kind: "number",
    render: (r) => {
      if (r.days_until_deadline === null) return <EmptyCell />;
      const d = r.days_until_deadline;
      const cls =
        d < 0
          ? "text-negative-600 font-semibold"
          : d <= 14
            ? "text-warning-600 font-semibold"
            : undefined;
      return (
        <span className={cls}>
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
        countLabel={GLOBAL_UI_MESSAGES.common.clients}
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
