import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, reportsQK } from "../api";
import { getTotalPages } from "@/utils/paginationUtils";
import { PAGE_SIZE_MD as PAGE_SIZE } from "@/constants/pagination.constants";

export const useVatComplianceReport = () => {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: reportsQK.vatCompliance(year, page, PAGE_SIZE),
    queryFn: () => reportsApi.getVatComplianceReport(year, page, PAGE_SIZE),
  });

  const totalPages = data ? getTotalPages(data.total, PAGE_SIZE) : 1;

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setPage(1);
  };

  return { year, setYear: handleYearChange, page, setPage, totalPages, data, isLoading, error };
};
