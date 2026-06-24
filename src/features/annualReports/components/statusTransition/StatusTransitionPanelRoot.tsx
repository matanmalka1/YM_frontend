import { ShieldCheck } from 'lucide-react'
import { getStatusLabel, getStatusVariant } from '../../api'
import { Badge } from '../../../../components/ui/primitives/Badge'
import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import type { StatusTransitionPanelProps } from '../../types'
import { AmendReportModal } from './AmendReportModal'
import { TransitionDetailsForm } from './TransitionDetailsForm'
import { TransitionTargetSelector } from './TransitionTargetSelector'
import { ReadinessCheckPanel } from '../panel/ReadinessCheckPanel'
import { useStatusTransitionPanel } from '../../hooks/useStatusTransitionPanel'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

export const StatusTransitionPanel = ({ report, onTransition, isLoading }: StatusTransitionPanelProps) => {
  const panel = useStatusTransitionPanel(report, onTransition)

  if (panel.allowed.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-500">
        {ANNUAL_REPORTS_MESSAGES.statusTransitionPanel.noTransitions(getStatusLabel(report.status))}
      </div>
    )
  }

  return (
    <>
      <AmendReportModal
        open={panel.amendOpen}
        reason={panel.amendReason}
        isPending={panel.isAmending}
        onReasonChange={panel.setAmendReason}
        onClose={panel.closeAmendModal}
        onSubmit={panel.submitAmend}
      />

      <Card
        title={ANNUAL_REPORTS_MESSAGES.statusTransitionPanel.title}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            onClick={panel.toggleReadiness}
            className="text-xs text-gray-500 hover:text-gray-700 px-1.5"
          >
            {ANNUAL_REPORTS_MESSAGES.statusTransitionPanel.readinessCheck}
          </Button>
        }
      >
        <div className="space-y-4">
          {panel.readinessOpen && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <ReadinessCheckPanel reportId={report.id} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{ANNUAL_REPORTS_MESSAGES.statusTransitionPanel.currentStatus}</span>
              <Badge variant={getStatusVariant(report.status)}>{getStatusLabel(report.status)}</Badge>
            </div>
            {report.status === 'submitted' && (
              <Button type="button" variant="outline" size="sm" onClick={panel.openAmendModal}>
                {ANNUAL_REPORTS_MESSAGES.statusTransitionPanel.amendReport}
              </Button>
            )}
          </div>

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
      </Card>
    </>
  )
}
