import { AlertTriangle, Clock, DollarSign } from "lucide-react";
import { StatsCard } from "../../../components/ui/layout/StatsCard";
import type { AgingReportResponse } from "../api";
import { formatILS, toReportNumber, type ReportMoneyValue } from "../utils";

interface AgingReportHeaderProps {
  data: AgingReportResponse;
}

const getBucketShare = (amount: ReportMoneyValue, total: ReportMoneyValue) => {
  const numericAmount = toReportNumber(amount);
  const numericTotal = toReportNumber(total);
  return numericTotal > 0
    ? `${Math.round((numericAmount / numericTotal) * 100)}% מסך החוב`
    : "0% מסך החוב";
};

export const AgingReportHeader: React.FC<AgingReportHeaderProps> = ({ data }) => {
  const buckets = [
    {
      title: "עד 30 יום",
      amount: data.summary.total_current,
      variant: "blue" as const,
    },
    {
      title: "31-60 יום",
      amount: data.summary.total_30_days,
      variant: "neutral" as const,
    },
    {
      title: "61-90 יום",
      amount: data.summary.total_60_days,
      variant: "green" as const,
    },
    {
      title: "מעל 90 יום",
      amount: data.summary.total_90_plus,
      variant: "red" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {data.capped && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            הדוח מוגבל ל־{data.cap_limit.toLocaleString("he-IL")} חיובים. ייתכן שחובות נוספים אינם מוצגים וסכום הכולל אינו מלא.
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatsCard
          title='סה"כ חובות'
          value={formatILS(data.total_outstanding)}
          icon={DollarSign}
          variant="blue"
          description={`${data.summary.total_clients} לקוחות עם יתרות פתוחות`}
        />
        {buckets.map((bucket) => (
          <StatsCard
            key={bucket.title}
            title={bucket.title}
            value={formatILS(bucket.amount)}
            icon={Clock}
            variant={bucket.variant}
            description={getBucketShare(bucket.amount, data.total_outstanding)}
          />
        ))}
      </div>
    </div>
  );
};

AgingReportHeader.displayName = "AgingReportHeader";
