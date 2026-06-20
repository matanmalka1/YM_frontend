import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, reportsQK } from "../api";

export const useAdvancePaymentReport = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState<number | undefined>(undefined);

  const { data, isLoading, error } = useQuery({
    queryKey: reportsQK.advancePayments(year, month),
    queryFn: () => reportsApi.getAdvancePaymentReport(year, month),
  });

  return { year, setYear, month, setMonth, data, isLoading, error };
};
