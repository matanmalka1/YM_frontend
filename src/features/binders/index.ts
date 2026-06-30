// Public surface of the binders feature — only import from this barrel externally
export { bindersApi, bindersQK } from './api'
export { BinderDetailDrawer } from './components/drawer/BinderDetailDrawer'

export { BindersStatsSection } from './components/list/BindersStatsSection'
export { useBindersPage } from './hooks/useBindersPage'

export { Binders } from './pages/BindersPage'
export type { BinderDetailResponse } from './api'

export {
  getBinderLocationStatusLabel,
  BINDER_LOCATION_STATUS_OPTIONS,
  BINDER_CAPACITY_STATUS_OPTIONS,
} from './constants'
