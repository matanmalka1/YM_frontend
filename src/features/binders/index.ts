// Public surface of the binders feature — only import from this barrel externally
export { bindersApi, bindersQK } from './api'
export { BinderDetailDrawer } from './components/drawer/BinderDetailDrawer'
export { ClientBindersTab } from './components/shared/ClientBindersTab'

export { BindersStatsSection } from './components/list/BindersStatsSection'
export { useBindersPage } from './hooks/useBindersPage'

export { Binders } from './pages/BindersPage'

export {
  getBinderLocationStatusLabel,
  isBinderCapacityStatus,
  isBinderLocationStatus,
  BINDER_LOCATION_STATUS_OPTIONS,
  BINDER_CAPACITY_STATUS_OPTIONS,
} from './constants'
export type { BinderCapacityStatus, BinderLocationStatus } from './constants'
