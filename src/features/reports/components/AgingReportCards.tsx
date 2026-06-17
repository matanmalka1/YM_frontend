import { useNavigate } from "react-router-dom";
import { StateCard } from "../../../components/ui/feedback/StateCard";
import { Inbox } from "lucide-react";
import type { AgingReportItem } from "../api";
import { formatCount, formatDate } from "../../../utils/utils";
import { Badge } from "../../../components/ui/primitives/Badge";
import { formatILS, toReportNumber, type ReportMoneyValue } from "../utils";

interface AgingReportCardsProps {
  items: AgingReportItem[];
}

const BUCKETS = [
  { key: "current", label: "עד 30", className: "bg-info-500" },
  { key: "days_30", label: "31-60", className: "bg-gray-500" },
  { key: "days_60", label: "61-90", className: "bg-warning-500" },
  { key: "days_90_plus", label: "90+", className: "bg-negative-500" },
] as const;

const getBucketPercent = (amount: ReportMoneyValue, total: ReportMoneyValue) => {
  const numericAmount = toReportNumber(amount);
  const numericTotal = toReportNumber(total);
  return numericTotal > 0
    ? Math.max((numericAmount / numericTotal) * 100, numericAmount > 0 ? 3 : 0)
    : 0;
};

export const AgingReportCards: React.FC<AgingReportCardsProps> = ({ items }) => {
  const navigate = useNavigate();

  if (items.length === 0) {
    return <StateCard icon={Inbox} message="אין חובות פתוחים" />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2" dir="rtl">
      {items.map((item) => (
        <button
          type="button"
          key={item.client_record_id}
          onClick={() => navigate(`/clients/${item.client_record_id}`)}
          className="rounded-xl border border-gray-200 bg-white p-5 text-right shadow-sm animate-fade-in cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{item.client_name}</p>
              <p className="text-xs text-gray-500">לקוח #{item.client_record_id}</p>
            </div>
            {toReportNumber(item.days_90_plus) > 0 && (
              <Badge variant="error">דורש טיפול</Badge>
            )}
          </div>

          <p className="text-2xl font-bold text-gray-900 tabular-nums">
            {formatILS(item.total_outstanding)}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">סה"כ חוב פתוח</p>

          <div className="mt-4 overflow-hidden rounded-full bg-gray-100">
            <div className="flex h-2 w-full">
              {BUCKETS.map((bucket) => (
                <div
                  key={bucket.key}
                  className={bucket.className}
                  style={{
                    width: `${getBucketPercent(item[bucket.key], item.total_outstanding)}%`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BUCKETS.map((bucket) => (
              <div key={bucket.key} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">{bucket.label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-900 tabular-nums">
                  {formatILS(item[bucket.key])}
                </p>
              </div>
            ))}
          </div>

          {item.oldest_invoice_date && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-sm text-gray-500">
              <span>חוב מאז {formatDate(item.oldest_invoice_date)}</span>
              {item.oldest_invoice_days != null && (
                <span className="font-medium text-gray-700 tabular-nums">
                  {formatCount(item.oldest_invoice_days)} ימים
                </span>
              )}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

AgingReportCards.displayName = "AgingReportCards";
