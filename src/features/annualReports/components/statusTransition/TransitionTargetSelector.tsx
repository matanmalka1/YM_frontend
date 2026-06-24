import { getStatusLabel } from '../../api'
import { SegmentedControl, SegmentedControlItem } from '../../../../components/ui/primitives/SegmentedControl'
import type { TransitionTargetSelectorProps } from '../../types'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

export const TransitionTargetSelector = ({ allowed, selected, onSelect }: TransitionTargetSelectorProps) => {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-gray-500">{ANNUAL_REPORTS_MESSAGES.transitionTargetSelector.label}</p>
      <SegmentedControl
        variant="choice"
        role="group"
        aria-label={ANNUAL_REPORTS_MESSAGES.transitionTargetSelector.ariaLabel}
      >
        {allowed.map((status) => (
          <SegmentedControlItem
            key={status}
            role="button"
            variant="choice"
            selected={selected === status}
            aria-pressed={selected === status}
            onClick={() => onSelect(status)}
          >
            {getStatusLabel(status)}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  )
}
