import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "../../../components/ui/primitives/Button";
import { PageStateGuard } from "../../../components/ui/layout/PageStateGuard";
import { PageHeader } from "../../../components/layout/PageHeader";
import { DatePicker } from "../../../components/ui/inputs/DatePicker";
import { PaginationCard } from "../../../components/ui/table/PaginationCard";
import { AgingReportHeader } from "../components/AgingReportHeader";
import { AgingReportTable } from "../components/AgingReportTable";
import { useAgingReport } from "../hooks/useAgingReport";

interface AgingReportViewProps {
  embedded?: boolean
}

export const AgingReportView: React.FC<AgingReportViewProps> = ({ embedded = false }) => {
  const { asOfDate, setAsOfDate, page, setPage, totalPages, exporting, handleExport, data, isLoading, error } =
    useAgingReport();

  const actions = (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("excel")}
        isLoading={exporting === "excel"}
        disabled={exporting !== null}
        className="gap-2"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("pdf")}
        isLoading={exporting === "pdf"}
        disabled={exporting !== null}
        className="gap-2"
      >
        <FileDown className="h-4 w-4" />
        PDF
      </Button>
    </div>
  );

  const header = embedded ? undefined : (
    <PageHeader
      title="דוח חובות לקוחות"
      description="ניתוח חובות לפי גיל החוב"
      actions={actions}
    />
  );

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage="טוען דוח...">
      {data && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xs">
              <DatePicker label="נכון לתאריך" value={asOfDate} onChange={setAsOfDate} />
            </div>
            {embedded && actions}
          </div>
          <AgingReportHeader data={data} />
          <AgingReportTable items={data.items} />
          {totalPages > 1 && (
            <PaginationCard
              page={page}
              totalPages={totalPages}
              total={data.total}
              label="לקוחות"
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </PageStateGuard>
  );
};

AgingReportView.displayName = "AgingReportView";
