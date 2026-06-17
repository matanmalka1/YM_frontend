import { PageHeader } from "../../../components/layout/PageHeader";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { AnnualReportStatusTable } from "../components/AnnualReportStatusTable";
import { useAnnualReportStatusReport } from "../hooks/useAnnualReportStatusReport";

interface AnnualReportStatusViewProps {
  taxYear?: number;
}

export const AnnualReportStatusView: React.FC<AnnualReportStatusViewProps> = ({ taxYear: taxYearProp }) => {
  const { taxYear, data, isLoading, error } =
    useAnnualReportStatusReport(taxYearProp);

  const header = (
    <PageHeader
      title="סטטוס דוחות שנתיים"
      description={data ? `סה"כ ${data.total} דוחות לשנת ${taxYear}` : ""}
    />
  );

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage="טוען דוח...">
      {data && <AnnualReportStatusTable statuses={data.statuses} />}
    </PageStateGuard>
  );
};

AnnualReportStatusView.displayName = "AnnualReportStatusView";
