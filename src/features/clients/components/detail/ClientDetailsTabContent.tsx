import { type FC } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClientDetailsOverviewTab, type ClientDetailsOverviewTabProps } from './ClientDetailsOverviewTab'
import { ClientDetailsTabBar } from './ClientDetailsTabBar'
import { CLIENT_DETAILS_TABS, type ActiveClientDetailsTab } from '../../constants'
import { CLIENT_ROUTES } from '../../api/endpoints'

type ClientDetailsTabContentProps = {
  initialTab?: ActiveClientDetailsTab
  overviewProps: Omit<ClientDetailsOverviewTabProps, 'activeTab'>
}

export const ClientDetailsTabContent: FC<ClientDetailsTabContentProps> = ({
  initialTab = 'details',
  overviewProps,
}) => {
  const navigate = useNavigate()
  const { clientId } = useParams<{ clientId: string }>()

  const activeTab: ActiveClientDetailsTab = CLIENT_DETAILS_TABS.includes(initialTab) ? initialTab : 'details'

  const handleTabChange = (tab: ActiveClientDetailsTab) => {
    if (!clientId) return
    navigate(CLIENT_ROUTES.tab(clientId, tab), { replace: true })
  }

  return (
    <div className="space-y-4">
      <ClientDetailsTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <ClientDetailsOverviewTab {...overviewProps} activeTab={activeTab} />
    </div>
  )
}
