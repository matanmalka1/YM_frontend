import { type FC } from 'react'
import { cn } from '../../../../utils/utils'
import { CLIENT_DETAILS_TABS, CLIENT_DETAILS_TAB_LABELS, type ActiveClientDetailsTab } from '../../constants'

type ClientDetailsTabBarProps = {
  activeTab: ActiveClientDetailsTab
  onTabChange: (tab: ActiveClientDetailsTab) => void
}

export const ClientDetailsTabBar: FC<ClientDetailsTabBarProps> = ({ activeTab, onTabChange }) => (
  <div role="tablist" aria-label="לשוניות לקוח" className="flex flex-wrap items-center gap-1 border-b border-gray-200">
    {CLIENT_DETAILS_TABS.map((tab) => {
      const isActive = activeTab === tab

      return (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={isActive}
          onClick={() => onTabChange(tab)}
          className={cn(
            'relative shrink-0 rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            isActive ? 'bg-white text-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
          )}
        >
          {CLIENT_DETAILS_TAB_LABELS[tab]}

          {isActive && <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-t-full bg-primary" />}
        </button>
      )
    })}
  </div>
)
