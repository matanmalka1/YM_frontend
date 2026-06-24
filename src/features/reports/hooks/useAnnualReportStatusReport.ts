import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, reportsQK } from "../api";
import { getErrorMessage } from "../../../utils/utils";
import { REPORTS_MESSAGES } from "../messages";

export const useAnnualReportStatusReport = (controlledYear?: number) => {
  const [internalYear, setInternalYear] = useState<number>(() => new Date().getFullYear());
  const taxYear = controlledYear ?? internalYear;

  const { data, isPending, error } = useQuery({
    queryKey: reportsQK.annualReportStatus(taxYear),
    queryFn: () => reportsApi.getAnnualReportStatusReport(taxYear),
  });

  return {
    taxYear,
    setTaxYear: setInternalYear,
    data,
    isLoading: isPending,
    error: error
      ? getErrorMessage(error, REPORTS_MESSAGES.common.loadError)
      : null,
  };
};
