import { GLOBAL_UI_MESSAGES } from '@/messages'
import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "../../../components/ui/primitives/Button";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { PageHeader } from "../../../components/layout/PageHeader";
import { DatePicker } from "../../../components/ui/inputs/DatePicker";
import { PaginationCard } from '@/components/ui/table';
import { AgingReportHeader } from "../components/AgingReportHeader";
import { AgingReportCards } from "../components/AgingReportCards";
import { useAgingReport } from "../hooks/useAgingReport";
import { REPORTS_MESSAGES } from "../messages";

interface AgingReportViewProps {
  embedded?: boolean
}

export const AgingReportView: React.FC<AgingReportViewProps> = ({ embedded = false }) => {
  const { asOfDate, setAsOfDate, page, setPage, totalPages, exporting, handleExport, data, isLoading, error } =
    useAgingReport();

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="primary"
        size="sm"
        icon={<FileSpreadsheet className="h-4 w-4" />}
        onClick={() => handleExport("excel")}
        isLoading={exporting === "excel"}
        disabled={exporting !== null}
      >
        Excel
      </Button>
      <Button
        variant="primary"
        size="sm"
        icon={<FileDown className="h-4 w-4" />}
        onClick={() => handleExport("pdf")}
        isLoading={exporting === "pdf"}
        disabled={exporting !== null}
      >
        PDF
      </Button>
    </div>
  );

  const header = embedded ? undefined : (
    <PageHeader
      title={REPORTS_MESSAGES.aging.title}
      description={REPORTS_MESSAGES.aging.description}
      actions={actions}
    />
  );

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage={REPORTS_MESSAGES.common.loadingReport}>
      {data && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xs">
              <DatePicker label={REPORTS_MESSAGES.aging.asOfDate} value={asOfDate} onChange={setAsOfDate} />
            </div>
            {embedded && actions}
          </div>
          <AgingReportHeader data={data} />
          <AgingReportCards items={data.items} />
          {totalPages > 1 && (
            <PaginationCard
              page={page}
              totalPages={totalPages}
              total={data.total}
              label={GLOBAL_UI_MESSAGES.common.clients}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </PageStateGuard>
  );
};

AgingReportView.displayName = "AgingReportView";
