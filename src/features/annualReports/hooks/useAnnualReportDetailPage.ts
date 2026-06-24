import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../../../hooks/useRole'
import { annualReportsApi } from '../api'
import { toast } from '../../../utils/toast'
import { useReportDetail } from './useReportDetail'
import type { SectionKey } from '../types'
import type { StatusTransitionPayload } from '../api'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../errorMessages'

export const useAnnualReportDetailPage = (reportId: number, backPath: string) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('overview')
  const [isDirty, setIsDirty] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const submitRef = useRef<(() => void) | null>(null)
  const navigate = useNavigate()
  const { isAdvisor } = useRole()

  const onDeleted = useCallback(() => navigate(backPath), [navigate, backPath])

  const detail = useReportDetail(reportId, onDeleted)

  const handleSave = useCallback(() => {
    submitRef.current?.()
  }, [])

  const handleExportPdf = useCallback(async () => {
    if (!detail.report) return
    setIsExportingPdf(true)
    try {
      await annualReportsApi.exportPdf(reportId, detail.report.tax_year)
    } catch {
      toast.error(ANNUAL_REPORTS_ERROR_MESSAGES.reports.draftExport)
    } finally {
      setIsExportingPdf(false)
    }
  }, [detail.report, reportId])

  const handleTransition = useCallback(
    (payload: StatusTransitionPayload) => {
      detail.transition(payload)
    },
    [detail],
  )

  const handleDeleteConfirm = useCallback(async () => {
    await detail.deleteReport()
    setShowDeleteConfirm(false)
  }, [detail])

  return {
    ...detail,
    activeSection,
    setActiveSection,
    isDirty,
    setIsDirty,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isExportingPdf,
    isAdvisor,
    submitRef,
    handleSave,
    handleExportPdf,
    handleTransition,
    handleDeleteConfirm,
  }
}
