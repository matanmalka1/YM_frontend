import { PageHeader } from "../../../components/layout/PageHeader";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { AdvancePaymentReportTable } from "./AdvancePaymentReportTable";
import { useAdvancePaymentReport } from "../hooks/useAdvancePaymentReport";
import { MONTH_OPTIONS as BASE_MONTH_OPTIONS, formatPercent } from "../../../utils/utils";
import { getOperationalYearOptions } from "@/constants/periodOptions.constants";
import { Select } from "../../../components/ui/inputs/Select";
import { ALL_MONTHS_OPTION } from "@/constants/filterOptions.constants";

const MONTH_OPTIONS = [ALL_MONTHS_OPTION, ...BASE_MONTH_OPTIONS];

export const AdvancePaymentReportView: React.FC = () => {
  const { year, setYear, month, setMonth, data, isLoading, error } =
    useAdvancePaymentReport();

  const actions = (
    <div className="flex items-center gap-2">
      <Select
        value={String(year)}
        onChange={(e) => setYear(Number(e.target.value))}
        options={getOperationalYearOptions()}
        fieldClassName="w-28"
      />
      <Select
        value={month != null ? String(month) : ""}
        onChange={(e) =>
          setMonth(e.target.value ? Number(e.target.value) : undefined)
        }
        options={MONTH_OPTIONS}
        fieldClassName="w-36"
      />
    </div>
  );

  const description = data
    ? `${data.items.length} לקוחות · אחוז גבייה: ${formatPercent(data.collection_rate)}`
    : "";

  const header = (
    <PageHeader
      title="דוח גבייה — מקדמות"
      description={description}
      actions={actions}
    />
  );

  return (
    <PageStateGuard isLoading={isLoading} error={error?.message ?? null} header={header} loadingMessage="טוען דוח...">
      {data && <AdvancePaymentReportTable data={data} />}
    </PageStateGuard>
  );
};

AdvancePaymentReportView.displayName = "AdvancePaymentReportView";
