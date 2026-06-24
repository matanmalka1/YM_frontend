import { PageHeader } from "../../../components/layout/PageHeader";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { AnnualReportStatusTable } from "../components/AnnualReportStatusTable";
import { useAnnualReportStatusReport } from "../hooks/useAnnualReportStatusReport";
import { REPORTS_MESSAGES } from "../messages";

interface AnnualReportStatusViewProps {
  taxYear?: number;
}

export const AnnualReportStatusView: React.FC<AnnualReportStatusViewProps> = ({ taxYear: taxYearProp }) => {
  const { taxYear, data, isLoading, error } =
    useAnnualReportStatusReport(taxYearProp);

  const header = (
    <PageHeader
      title={REPORTS_MESSAGES.annualStatus.title}
      description={data ? REPORTS_MESSAGES.annualStatus.description(data.total, taxYear) : ""}
    />
  );

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage={REPORTS_MESSAGES.common.loadingReport}>
      {data && <AnnualReportStatusTable statuses={data.statuses} />}
    </PageStateGuard>
  );
};

AnnualReportStatusView.displayName = "AnnualReportStatusView";
