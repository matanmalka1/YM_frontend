import { type FC } from 'react'
import { SegmentedControl, SegmentedControlItem } from '../../../../components/ui/primitives/SegmentedControl'
import { CLIENT_DETAILS_TABS, CLIENT_DETAILS_TAB_LABELS, type ActiveClientDetailsTab } from '../../constants'
import { CLIENTS_MESSAGES } from '../../messages'

type ClientDetailsTabBarProps = {
  activeTab: ActiveClientDetailsTab
  onTabChange: (tab: ActiveClientDetailsTab) => void
}

export const ClientDetailsTabBar: FC<ClientDetailsTabBarProps> = ({ activeTab, onTabChange }) => (
  <SegmentedControl variant="underline" aria-label={CLIENTS_MESSAGES.details.tabBarAriaLabel}>
    {CLIENT_DETAILS_TABS.map((tab) => {
      const isActive = activeTab === tab

      return (
        <SegmentedControlItem key={tab} variant="underline" selected={isActive} onClick={() => onTabChange(tab)}>
          {CLIENT_DETAILS_TAB_LABELS[tab]}
        </SegmentedControlItem>
      )
    })}
  </SegmentedControl>
)
