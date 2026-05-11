import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ChevronDown, LogOut, Plus, Search, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { CLIENT_ROUTES } from '@/features/clients'
import { ENTITY_TYPE_LABELS, VAT_TYPE_LABELS } from '@/features/clients/constants'
import { useRole } from '@/hooks/useRole'
import { getRoleLabel } from '@/utils/enums'
import { cn, formatClientOfficeId } from '@/utils/utils'
import { useClientSidebarClients, type ClientSidebarItem } from './useClientSidebarClients'

type GroupMode = 'entity' | 'vat'

interface ClientGroup {
  key: string
  label: string
  clients: ClientSidebarItem[]
}

const GROUP_MODES: Array<{ value: GroupMode; label: string }> = [
  { value: 'entity', label: 'סוג' },
  { value: 'vat', label: 'מע״מ' },
]

const getGroupInfo = (
  client: ClientSidebarItem,
  groupMode: GroupMode,
): { key: string; label: string } => {
  if (groupMode === 'entity') {
    const key = client.entityType ?? 'unknown'
    return { key, label: client.entityType ? ENTITY_TYPE_LABELS[client.entityType] : 'ללא סוג' }
  }
  const key = client.vatReportingFrequency ?? 'unknown'
  return {
    key,
    label: client.vatReportingFrequency ? VAT_TYPE_LABELS[client.vatReportingFrequency] : 'ללא מע״מ',
  }
}

const groupClients = (clients: ClientSidebarItem[], groupMode: GroupMode): ClientGroup[] => {
  const groups = new Map<string, ClientGroup>()

  clients.forEach((client) => {
    const { key, label } = getGroupInfo(client, groupMode)
    const group = groups.get(key)

    if (group) {
      group.clients.push(client)
      return
    }

    groups.set(key, { key, label, clients: [client] })
  })

  return Array.from(groups.values()).sort(
    (a, b) => b.clients.length - a.clients.length || a.label.localeCompare(b.label, 'he'),
  )
}

export const ClientSidebar: React.FC = () => {
  const [searchValue, setSearchValue] = useState('')
  const [groupMode, setGroupMode] = useState<GroupMode>('entity')
  const { clients, total, isLoading, isError } = useClientSidebarClients(searchValue)
  const { user, logout } = useAuthStore()
  const { can } = useRole()
  const clientGroups = useMemo(() => groupClients(clients, groupMode), [clients, groupMode])

  return (
    <aside className="hidden h-screen w-[220px] shrink-0 flex-col border-l border-gray-200 bg-white text-gray-900 md:flex 2xl:w-[230px]">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-gray-200 px-3.5">
        <Link to="/" className="min-w-0 text-right" aria-label="לוח בקרה">
          <p className="truncate text-base font-bold leading-tight text-gray-950">YM Tax CRM</p>
        </Link>
      </div>

      {/* Search + controls — not scrollable */}
      <div className="shrink-0 space-y-2 border-b border-gray-100 p-2.5">
        <label className="relative block">
          <Search className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="חיפוש לקוח"
            className="h-8 w-full rounded-md border border-gray-200 bg-gray-50 pr-8 pl-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:ring-2 focus:ring-primary-100"
          />
        </label>

        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-gray-600">לקוחות</span>
            <span className="min-w-[18px] rounded-full bg-gray-100 px-1.5 text-center text-[11px] font-semibold tabular-nums text-gray-500">
              {total.toLocaleString('he-IL')}
            </span>
          </div>
          {can.createClients && (
            <Link
              to={`${CLIENT_ROUTES.list}?create=1`}
              className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-primary-50 hover:text-primary-600"
              aria-label="לקוח חדש"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-md bg-gray-100 p-1" aria-label="קיבוץ לקוחות">
          {GROUP_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setGroupMode(mode.value)}
              className={cn(
                'h-6 rounded text-xs font-medium transition',
                groupMode === mode.value
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:bg-white/60 hover:text-gray-800',
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Client list — only this scrolls */}
      <nav
        className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1.5 [scrollbar-color:rgba(148,163,184,0.28)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/25 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400/40"
        aria-label="לקוחות"
      >
        {/* TODO: Add client alerts once alert counts are exposed for this navigation surface. */}
        {isLoading ? (
          <p className="px-3 py-2 text-sm text-gray-500">טוען לקוחות...</p>
        ) : isError ? (
          <p className="px-3 py-2 text-sm text-negative-600">שגיאה בטעינת לקוחות</p>
        ) : clients.length === 0 ? (
          <p className="px-3 py-2 text-sm text-gray-500">לא נמצאו לקוחות</p>
        ) : (
          <div className="space-y-4">
            {clientGroups.map((group) => (
              <section key={group.key} aria-label={group.label}>
                {/* Group header */}
                <div className="mb-1 flex items-center gap-1 px-2 py-0.5">
                  <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
                  <span className="flex-1 truncate text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    {group.label}
                  </span>
                  <span className="shrink-0 text-[11px] font-semibold tabular-nums text-gray-400">
                    {group.clients.length}
                  </span>
                </div>

                <ul>
                  {group.clients.map((client) => (
                    <li key={client.id}>
                      <NavLink
                        to={CLIENT_ROUTES.detail(client.id)}
                        className={({ isActive }) =>
                          cn(
                            'block rounded-md border-r-[3px] px-2 py-1.5 text-right transition',
                            isActive
                              ? 'border-primary-400 bg-primary-50 text-primary-950'
                              : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-950',
                          )
                        }
                      >
                        <span className="block truncate text-[14px] font-medium">{client.displayName}</span>
                        <div className="flex items-end justify-between gap-2">
                          <span className="shrink-0 text-[12px] leading-5 text-gray-400">
                            {formatClientOfficeId(client.officeClientNumber)}
                          </span>
                            {client.phone ? (
                          <span dir="ltr" className="block truncate text-left shrink-0 text-[12px] leading-4 text-gray-400">
                            {client.phone}
                          </span>
                        ) : null}
                        </div>
                      
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-gray-200 px-2 py-2">
        <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
              <UserIcon className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <div className="min-w-0 text-right">
              <p className="truncate text-xs font-medium leading-tight text-gray-900">{user?.full_name || 'אורח'}</p>
              {user?.role && <p className="truncate text-[11px] leading-tight text-gray-400">{getRoleLabel(user.role)}</p>}
            </div>
          </div>
          <button
            onClick={() => void logout()}
            className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-negative-50 hover:text-negative-600"
            aria-label="התנתקות"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
