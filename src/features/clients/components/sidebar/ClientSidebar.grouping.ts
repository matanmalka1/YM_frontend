import type { ClientSidebarItem } from './useClientSidebarClients'
import { getEntityLabel, getVatLabel } from './ClientSidebar.labels'

export type GroupMode = 'entity' | 'vat'

export interface ClientGroup {
  key: string
  label: string
  clients: ClientSidebarItem[]
}

export const GROUP_MODES: Array<{ value: GroupMode; label: string }> = [
  { value: 'entity', label: 'סוג התאגדות' },
  { value: 'vat', label: 'דיווח מע״מ' },
]

const getGroupInfo = (client: ClientSidebarItem, groupMode: GroupMode): { key: string; label: string } => {
  if (groupMode === 'entity') {
    const key = client.entityType ?? 'unknown'
    return { key, label: getEntityLabel(client) }
  }
  const key = client.vatReportingFrequency ?? 'unknown'
  return { key, label: getVatLabel(client) }
}

export const groupClients = (clients: ClientSidebarItem[], groupMode: GroupMode): ClientGroup[] => {
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

  return Array.from(groups.values()).sort((a, b) => b.clients.length - a.clients.length || a.label.localeCompare(b.label, 'he'))
}
