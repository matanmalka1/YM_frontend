import { useCallback, useMemo, useState, type RefObject } from 'react'
import { useDebounce } from 'use-debounce'
import { SkeletonBlock } from '../../ui/primitives/SkeletonBlock'
import { Badge } from '../../ui/primitives/Badge'
import { Button } from '../../ui/primitives/Button'
import { DismissBackdrop } from '../../ui/primitives/DismissBackdrop'
import { SegmentedControl, SegmentedControlItem } from '../../ui/primitives/SegmentedControl'
import { ActionSurfaceLink } from '../../ui/primitives/ActionSurface'
import { Input } from '../../ui/inputs/Input'
import { InlineState } from '../../ui/feedback/InlineState'
import { AlertCircle, LogOut, Search, User as UserIcon, Users, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { CLIENT_ROUTES } from '@/features/clients'
import { useRole } from '@/hooks/useRole'
import { getRoleLabel } from '@/features/users'
import { cn, formatCount } from '@/utils/utils'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { CLIENT_SIDEBAR_PAGE_SIZE, useClientSidebarClients } from './useClientSidebarClients'
import { ClientSidebarClientCard } from './ClientSidebarClientCard'
import { GROUP_MODES, groupClients, type GroupMode } from './ClientSidebar.grouping'
import { useClientSidebarFocusTrap } from './useClientSidebarFocusTrap'
import { CLIENT_SEARCH_WITH_CONTACT_PLACEHOLDER } from '@/constants/searchPlaceholders.constants'

interface ClientSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  mobileTriggerRef: RefObject<HTMLButtonElement | null>
  desktopOpen: boolean
}

const CLIENT_SIDEBAR_TEXT = {
  brandMark: 'YM',
  brandName: 'YM tax CRM',
  brandSubtitle: 'מערכת ניהול למשרד רואי חשבון',
  dashboardAriaLabel: 'מעבר ללוח הבקרה',
  closeListAriaLabel: 'סגירת רשימת לקוחות',
  sidebarAriaLabel: 'רשימת לקוחות',
  searchAriaLabel: 'חיפוש לקוח',
  listCountLabel: 'ברשימה',
  createClientLabel: 'לקוח חדש',
  createClientAriaLabel: 'הוספת לקוח חדש',
  groupAriaLabel: 'קיבוץ לקוחות',
  loadingClientsLabel: 'טוען לקוחות',
  loadErrorTitle: 'לא הצלחנו לטעון את הלקוחות',
  emptySearchTitle: 'לא נמצאו לקוחות מתאימים',
  emptyTitle: 'עדיין אין לקוחות',
  emptySearchDescription: 'נסו לחפש בשם או במספר אחר',
  truncatedPrefix: 'מוצגים',
  truncatedSeparator: 'מתוך',
  guestUserName: 'אורח',
  logoutAriaLabel: 'התנתקות',
} as const

export const ClientSidebar: React.FC<ClientSidebarProps> = ({ mobileOpen, onMobileClose, mobileTriggerRef, desktopOpen }) => {
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch] = useDebounce(searchValue, 350)
  const [groupMode, setGroupMode] = useState<GroupMode>('entity')
  const { clients, total, hasSearch, isLoading, isError, refetch } = useClientSidebarClients(debouncedSearch)
  const { user, logout } = useAuthStore()
  const { can } = useRole()
  const clientGroups = useMemo(() => groupClients(clients, groupMode), [clients, groupMode])
  const isTruncated = !hasSearch && total > clients.length

  const closeMobileIfOpen = useCallback(() => {
    if (mobileOpen) onMobileClose()
  }, [mobileOpen, onMobileClose])

  const { sidebarRef, searchInputRef } = useClientSidebarFocusTrap({ mobileOpen, mobileTriggerRef, onMobileClose })

  return (
    <>
      <DismissBackdrop open={mobileOpen} onDismiss={onMobileClose} ariaLabel={CLIENT_SIDEBAR_TEXT.closeListAriaLabel} />
      <div
        className={cn(
          'hidden shrink-0 overflow-hidden transition-[width] duration-300 md:block',
          desktopOpen ? 'md:w-[280px] 2xl:w-[300px]' : 'md:w-0',
        )}
        aria-hidden={!desktopOpen}
      >
        <aside
          ref={sidebarRef}
          className={cn(
            'fixed bottom-0 right-0 top-14 z-50 flex w-[min(320px,calc(100vw-2rem))] shrink-0 flex-col border-l border-gray-200/80 bg-white text-gray-900 shadow-2xl transition-transform duration-300',
            mobileOpen ? 'visible translate-x-0' : 'invisible pointer-events-none translate-x-full',
            'md:visible md:static md:z-auto md:h-full md:w-[280px] md:translate-x-0 md:pointer-events-auto md:shadow-none 2xl:w-[300px]',
            !desktopOpen && 'md:invisible md:pointer-events-none',
          )}
          role={mobileOpen ? 'dialog' : undefined}
          aria-modal={mobileOpen ? 'true' : undefined}
          aria-label={mobileOpen ? CLIENT_SIDEBAR_TEXT.sidebarAriaLabel : undefined}
        >
          <div className="shrink-0 px-3 pb-2 pt-2.5">
            <div className="flex items-center justify-between gap-2">
              <ActionSurfaceLink
                variant="compact"
                to="/"
                onClick={closeMobileIfOpen}
                className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-right"
                aria-label={CLIENT_SIDEBAR_TEXT.dashboardAriaLabel}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-2xs font-bold tracking-tight text-gray-900">
                  {CLIENT_SIDEBAR_TEXT.brandMark}
                </span>
                <span className="min-w-0 text-right">
                  <span
                    dir="ltr"
                    className="block truncate text-right font-[family-name:var(--font-display)] text-xs font-bold leading-tight text-gray-950"
                  >
                    {CLIENT_SIDEBAR_TEXT.brandName}
                  </span>
                  <span className="mt-0.5 block truncate text-2xs leading-none text-gray-500/90">
                    {CLIENT_SIDEBAR_TEXT.brandSubtitle}
                  </span>
                </span>
              </ActionSurfaceLink>
              <Button
                variant="ghost"
                shape="square"
                icon={<X className="h-4 w-4" />}
                onClick={onMobileClose}
                className="mt-1 text-gray-500 hover:bg-gray-100 md:hidden"
                aria-label={GLOBAL_UI_MESSAGES.actions.close}
              />
            </div>
          </div>

          <div className="shrink-0 space-y-2 border-b border-gray-100 px-3 pb-2.5">
            <Input
              ref={searchInputRef}
              type="search"
              size="xs"
              aria-label={CLIENT_SIDEBAR_TEXT.searchAriaLabel}
              startIcon={<Search className="h-3 w-3" />}
              className="h-8 rounded-xl border-gray-200 bg-gray-50 text-2xs shadow-none placeholder:text-gray-400 focus:bg-white"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={CLIENT_SEARCH_WITH_CONTACT_PLACEHOLDER}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Users className="h-3.5 w-3.5" />
                </span>
                <div>
                  <p className="text-xs font-semibold leading-tight text-gray-900">{GLOBAL_UI_MESSAGES.common.clients}</p>
                  <p className="mt-0.5 text-2xs leading-tight text-gray-500">
                    <span className="tabular-nums">{formatCount(hasSearch ? clients.length : total)}</span>{' '}
                    {hasSearch ? GLOBAL_UI_MESSAGES.common.results : CLIENT_SIDEBAR_TEXT.listCountLabel}
                  </p>
                </div>
              </div>
              {can.createClients ? (
                <ActionSurfaceLink
                  variant="compact"
                  to={`${CLIENT_ROUTES.list}?create=1`}
                  onClick={closeMobileIfOpen}
                  className="focus-ring flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-2xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
                  aria-label={CLIENT_SIDEBAR_TEXT.createClientAriaLabel}
                >
                  {CLIENT_SIDEBAR_TEXT.createClientLabel}
                </ActionSurfaceLink>
              ) : null}
            </div>

            <SegmentedControl variant="switch" role="group" aria-label={CLIENT_SIDEBAR_TEXT.groupAriaLabel}>
              {GROUP_MODES.map((mode) => (
                <SegmentedControlItem
                  key={mode.value}
                  role="button"
                  variant="switch"
                  selected={groupMode === mode.value}
                  onClick={() => setGroupMode(mode.value)}
                  aria-pressed={groupMode === mode.value}
                >
                  {mode.label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2.5" aria-label={CLIENT_SIDEBAR_TEXT.sidebarAriaLabel}>
            {isLoading ? (
              <div className="space-y-2" aria-label={CLIENT_SIDEBAR_TEXT.loadingClientsLabel}>
                {Array.from({ length: 4 }, (_, index) => (
                  <SkeletonBlock
                    key={index}
                    height="h-28"
                    width="w-full"
                    className="rounded-xl border border-gray-100 bg-gray-50"
                  />
                ))}
              </div>
            ) : isError ? (
              <InlineState
                variant="error"
                icon={AlertCircle}
                title={CLIENT_SIDEBAR_TEXT.loadErrorTitle}
                action={{ label: GLOBAL_UI_MESSAGES.actions.retry, onClick: () => void refetch() }}
              />
            ) : clients.length === 0 ? (
              <InlineState
                icon={Users}
                title={hasSearch ? CLIENT_SIDEBAR_TEXT.emptySearchTitle : CLIENT_SIDEBAR_TEXT.emptyTitle}
                description={hasSearch ? CLIENT_SIDEBAR_TEXT.emptySearchDescription : undefined}
              />
            ) : (
              <div className="space-y-4">
                {isTruncated ? (
                  <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    {CLIENT_SIDEBAR_TEXT.truncatedPrefix} {formatCount(CLIENT_SIDEBAR_PAGE_SIZE)}{' '}
                    {CLIENT_SIDEBAR_TEXT.truncatedSeparator} {formatCount(total)}
                  </p>
                ) : null}
                {clientGroups.map((group) => (
                  <section key={group.key} aria-label={group.label}>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="flex-1 truncate text-xs font-semibold text-gray-600">{group.label}</span>
                      <Badge variant="neutral" size="2xs" className="shrink-0 font-semibold tabular-nums text-gray-500">
                        {group.clients.length}
                      </Badge>
                    </div>

                    <ul className="space-y-1.5">
                      {group.clients.map((client) => (
                        <li key={client.id}>
                          <ClientSidebarClientCard client={client} onNavigate={closeMobileIfOpen} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </nav>

          <div className="shrink-0 border-t border-gray-100 p-2.5">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-gray-50 px-2.5 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                  <UserIcon className="h-3.5 w-3.5 text-gray-500" />
                </div>
                <div className="min-w-0 text-right">
                  <p className="truncate text-xs font-semibold leading-tight text-gray-900">
                    {user?.full_name || CLIENT_SIDEBAR_TEXT.guestUserName}
                  </p>
                  {user?.role && (
                    <p className="mt-0.5 truncate text-2xs leading-tight text-gray-500">{getRoleLabel(user.role)}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                shape="square"
                size="sm"
                icon={<LogOut className="h-4 w-4" />}
                onClick={() => void logout()}
                className="text-gray-400 hover:bg-white hover:text-negative-600 hover:shadow-sm"
                aria-label={CLIENT_SIDEBAR_TEXT.logoutAriaLabel}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
