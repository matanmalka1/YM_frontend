import type { UserRole } from '@/types'

import type { NavItem } from './Navbar.constants'

export interface MoreNavGroup {
  label: string
  items: NavItem[]
}

export const buildMoreGroups = (items: NavItem[]): MoreNavGroup[] => {
  const groups = new Map<string, NavItem[]>()
  for (const item of items) {
    if (item.placement !== 'more') continue
    const label = item.moreGroup ?? 'עוד'
    const groupItems = groups.get(label) ?? []
    groupItems.push(item)
    groups.set(label, groupItems)
  }
  return Array.from(groups.entries()).map(([label, groupItems]) => ({
    label,
    items: groupItems,
  }))
}

export const canShowItem = (item: Pick<NavItem, 'roles'>, role?: UserRole): boolean => {
  if (!item.roles) return true
  if (!role) return false
  return item.roles.includes(role)
}

export const isRouteActive = (pathname: string, item: Pick<NavItem, 'to' | 'end'>) =>
  item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)
