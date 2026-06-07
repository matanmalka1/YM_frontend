import { Clock, DollarSign } from "lucide-react";
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
