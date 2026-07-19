import { useState } from 'react'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
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
  const [expanded, setExpanded] = useState(false)
  const hasTransitions = panel.allowed.length > 0
  const msg = ANNUAL_REPORTS_MESSAGES.statusTransitionPanel

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

      <Card size="compact" disablePadding className="shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-gray-500">{msg.currentStatus}</span>
            <Badge variant={getStatusVariant(report.status)}>{getStatusLabel(report.status)}</Badge>
          </div>

          <div className="flex items-center gap-2">
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
            {report.status === 'submitted' && (
              <Button type="button" variant="outline" size="sm" onClick={panel.openAmendModal}>
                {msg.amendReport}
              </Button>
            )}
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
    </>
  )
}
