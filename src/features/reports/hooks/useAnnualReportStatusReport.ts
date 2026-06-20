import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, reportsQK } from "../api";
import { getErrorMessage } from "../../../utils/utils";

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
      ? getErrorMessage(error, "שגיאה בטעינת הדוח")
      : null,
  };
};
