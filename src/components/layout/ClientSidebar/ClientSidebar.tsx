import { useCallback, useMemo, useState, type RefObject } from 'react'
import { useDebounce } from 'use-debounce'
import { Link } from 'react-router-dom'
import { SkeletonBlock } from '../../ui/primitives/SkeletonBlock'
import { LogOut, Plus, RefreshCw, Search, User as UserIcon, Users, X } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { CLIENT_ROUTES } from '@/features/clients'
import { useRole } from '@/hooks/useRole'
import { getRoleLabel } from '@/features/users'
import { cn, formatCount } from '@/utils/utils'
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

export const ClientSidebar: React.FC<ClientSidebarProps> = ({
  mobileOpen,
  onMobileClose,
  mobileTriggerRef,
  desktopOpen,
}) => {
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
      <button
        type="button"
        onClick={onMobileClose}
        className={cn(
          'fixed inset-x-0 bottom-0 top-16 z-40 bg-black/20 transition-opacity md:hidden',
          mobileOpen ? 'visible opacity-100' : 'invisible pointer-events-none opacity-0',
        )}
        aria-label="סגירת רשימת לקוחות"
        tabIndex={mobileOpen ? 0 : -1}
      />
      <div
        className={cn(
          'hidden shrink-0 overflow-hidden transition-[width] duration-300 md:block',
          desktopOpen ? 'md:w-[300px] 2xl:w-[320px]' : 'md:w-0',
        )}
        aria-hidden={!desktopOpen}
      >
        <aside
          ref={sidebarRef}
          className={cn(
            'fixed bottom-0 right-0 top-16 z-50 flex w-[min(320px,calc(100vw-2rem))] shrink-0 flex-col border-l border-gray-200/80 bg-white text-gray-900 shadow-2xl transition-transform duration-300',
            mobileOpen ? 'visible translate-x-0' : 'invisible pointer-events-none translate-x-full',
            'md:visible md:static md:z-auto md:h-full md:w-[300px] md:translate-x-0 md:pointer-events-auto md:shadow-none 2xl:w-[320px]',
            !desktopOpen && 'md:invisible md:pointer-events-none',
          )}
          role={mobileOpen ? 'dialog' : undefined}
          aria-modal={mobileOpen ? 'true' : undefined}
          aria-label={mobileOpen ? 'רשימת לקוחות' : undefined}
        >
          <div className="shrink-0 px-4 pb-3 pt-4">
            <div className="flex items-start justify-between gap-3">
              <Link
                to="/"
                onClick={closeMobileIfOpen}
                className="focus-ring flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1"
                aria-label="מעבר ללוח הבקרה"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tile border border-gray-200 bg-gray-100 text-sm font-bold tracking-tight text-gray-900">
                  YM
                </span>
                <span className="min-w-0 text-right">
                  <span
                    dir="ltr"
                    className="block truncate text-left font-[family-name:var(--font-display)] text-[15px] font-bold leading-tight text-gray-950"
                  >
                    YM tax CRM
                  </span>
                  <span className="mt-1 block truncate text-xs leading-none text-gray-500">
                    מערכת ניהול למשרד רואי חשבון
                  </span>
                </span>
              </Link>
              <button
                type="button"
                onClick={onMobileClose}
                className="focus-ring mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 md:hidden"
                aria-label="סגירה"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="shrink-0 space-y-3 border-b border-gray-100 px-4 pb-4">
            <label className="relative block">
              <span className="sr-only">חיפוש לקוח</span>
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={CLIENT_SEARCH_WITH_CONTACT_PLACEHOLDER}
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50/80 pr-9 pl-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-50"
              />
            </label>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <Users className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight text-gray-900">לקוחות</p>
                  <p className="mt-0.5 text-2xs leading-tight text-gray-500">
                    <span className="tabular-nums">{formatCount(hasSearch ? clients.length : total)}</span>{' '}
                    {hasSearch ? 'תוצאות' : 'ברשימה'}
                  </p>
                </div>
              </div>
              {can.createClients ? (
                <Link
                  to={`${CLIENT_ROUTES.list}?create=1`}
                  onClick={closeMobileIfOpen}
                  className="focus-ring flex h-9 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950"
                  aria-label="הוספת לקוח חדש"
                >
                  <Plus className="h-3.5 w-3.5" />
                  לקוח חדש
                </Link>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1" aria-label="קיבוץ לקוחות">
              {GROUP_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setGroupMode(mode.value)}
                  className={cn(
                    'focus-ring h-8 rounded-nav text-xs font-medium transition',
                    groupMode === mode.value
                      ? 'bg-white text-gray-950 shadow-sm'
                      : 'text-gray-500 hover:bg-white/70 hover:text-gray-800',
                  )}
                  aria-pressed={groupMode === mode.value}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3" aria-label="רשימת לקוחות">
            {isLoading ? (
              <div className="space-y-2" aria-label="טוען לקוחות">
                {Array.from({ length: 4 }, (_, index) => (
                  <SkeletonBlock
                    key={index}
                    height="h-32"
                    width="w-full"
                    className="rounded-2xl border border-gray-100 bg-gray-50"
                  />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-2xl border border-negative-100 bg-negative-50 p-4 text-center">
                <p className="text-sm font-semibold text-negative-800">לא הצלחנו לטעון את הלקוחות</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="focus-ring mx-auto mt-3 flex h-8 items-center gap-1.5 rounded-xl bg-white px-3 text-xs font-semibold text-negative-700 shadow-sm"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  ניסיון נוסף
                </button>
              </div>
            ) : clients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-4 py-8 text-center">
                <Users className="mx-auto h-5 w-5 text-gray-400" />
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {hasSearch ? 'לא נמצאו לקוחות מתאימים' : 'עדיין אין לקוחות'}
                </p>
                {hasSearch ? <p className="mt-1 text-xs text-gray-500">נסו לחפש בשם או במספר אחר</p> : null}
              </div>
            ) : (
              <div className="space-y-5">
                {isTruncated ? (
                  <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    מוצגים {formatCount(CLIENT_SIDEBAR_PAGE_SIZE)} מתוך {formatCount(total)}
                  </p>
                ) : null}
                {clientGroups.map((group) => (
                  <section key={group.key} aria-label={group.label}>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <span className="flex-1 truncate text-xs font-semibold text-gray-600">{group.label}</span>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-2xs font-semibold tabular-nums text-gray-500">
                        {group.clients.length}
                      </span>
                    </div>

                    <ul className="space-y-2">
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

          <div className="shrink-0 border-t border-gray-100 p-3">
            <div className="flex items-center justify-between gap-2 rounded-2xl bg-gray-50 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <UserIcon className="h-4 w-4 text-gray-500" />
                </div>
                <div className="min-w-0 text-right">
                  <p className="truncate text-xs font-semibold leading-tight text-gray-900">
                    {user?.full_name || 'אורח'}
                  </p>
                  {user?.role && (
                    <p className="mt-0.5 truncate text-2xs leading-tight text-gray-500">{getRoleLabel(user.role)}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void logout()}
                className="focus-ring shrink-0 rounded-xl p-2 text-gray-400 transition-colors hover:bg-white hover:text-negative-600 hover:shadow-sm"
                aria-label="התנתקות"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
