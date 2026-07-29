import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, History, ShieldCheck } from 'lucide-react'
import { getStatusLabel, getStatusVariant } from '../../constants/display'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { Select } from '@/components/ui/inputs/Select'
import { isObligationLocked } from '@/constants/obligationStatus.constants'
import { useAdvisorOptions } from '@/features/users'
import { showErrorToast } from '@/utils/utils'
import { toast } from '@/utils/toast'
import type { StatusTransitionPanelProps } from '../../types'
import { annualReportsApi, annualReportsQK } from '../../api'
import { TransitionDetailsForm } from './TransitionDetailsForm'
import { TransitionTargetSelector } from './TransitionTargetSelector'
import { ReadinessCheckPanel } from '../panel/ReadinessCheckPanel'
import { AnnualReportChainModal } from '../shared/AnnualReportChainModal'
import { useStatusTransitionPanel } from '../../hooks/useStatusTransitionPanel'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../../errorMessages'

export const StatusTransitionPanel = ({ report, onTransition, isLoading }: StatusTransitionPanelProps) => {
  const panel = useStatusTransitionPanel(report, onTransition)
  const [expanded, setExpanded] = useState(false)
  const [showChain, setShowChain] = useState(false)
  const hasTransitions = panel.allowed.length > 0
  const msg = ANNUAL_REPORTS_MESSAGES.statusTransitionPanel
  // Offered only when the tax year has more than one record — on an
  // untouched year there is no history to open.
  const hasChain = report.amends_id != null || report.superseded_at != null

  const isLocked = isObligationLocked(report.status)
  const advisorOptions = useAdvisorOptions(!isLocked)
  const queryClient = useQueryClient()
  const assignMutation = useMutation({
    mutationFn: (assignedTo: number | null) => annualReportsApi.updateMetadata(report.id, { assigned_to: assignedTo }),
    onSuccess: () => {
      toast.success(msg.assigneeUpdated)
      void queryClient.invalidateQueries({ queryKey: annualReportsQK.all })
    },
    onError: (error) => showErrorToast(error, ANNUAL_REPORTS_ERROR_MESSAGES.reports.update),
  })

  return (
    <>
      <Card size="compact" disablePadding className="shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <span className="text-gray-500">{msg.currentStatus}</span>
              <Badge variant={getStatusVariant(report.status)}>{getStatusLabel(report.status)}</Badge>
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gray-500">{msg.assigneeLabel}:</span>
              {isLocked ? (
                <span className="text-gray-700">
                  {report.assigned_to != null
                    ? (advisorOptions.nameById.get(report.assigned_to) ?? `#${report.assigned_to}`)
                    : msg.assigneeUnassigned}
                </span>
              ) : (
                <Select
                  size="sm"
                  aria-label={msg.assigneeLabel}
                  disabled={advisorOptions.isLoading || assignMutation.isPending}
                  options={[{ value: '', label: msg.assigneeUnassigned }, ...advisorOptions.options]}
                  value={report.assigned_to != null ? String(report.assigned_to) : ''}
                  onChange={(event) => assignMutation.mutate(event.target.value === '' ? null : Number(event.target.value))}
                />
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasChain && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<History className="h-3.5 w-3.5" />}
                onClick={() => setShowChain(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                {msg.viewChain}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              onClick={panel.toggleReadiness}
              className="text-gray-500 hover:text-gray-700"
            >
              {msg.readinessCheck}
            </Button>
            {hasTransitions ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                onClick={() => setExpanded((prev) => !prev)}
              >
                {msg.changeStatus}
              </Button>
            ) : (
              <span className="text-xs text-gray-400">{msg.noTransitions(getStatusLabel(report.status))}</span>
            )}
          </div>
        </div>

        {panel.readinessOpen && (
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
            <ReadinessCheckPanel reportId={report.id} />
          </div>
        )}

        {expanded && hasTransitions && (
          <div className="space-y-4 border-t border-gray-100 px-4 py-4">
            <TransitionTargetSelector allowed={panel.allowed} selected={panel.selected} onSelect={panel.select} />
            {panel.selected && (
              <TransitionDetailsForm
                selected={panel.selected}
                form={panel.form}
                isLoading={isLoading}
                onFieldChange={panel.setField}
                onCancel={panel.cancelTransition}
                onSubmit={panel.submitTransition}
              />
            )}
          </div>
        )}
      </Card>

      <AnnualReportChainModal open={showChain} reportId={report.id} onClose={() => setShowChain(false)} />
    </>
  )
}
