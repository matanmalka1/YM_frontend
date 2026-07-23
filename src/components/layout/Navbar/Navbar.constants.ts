import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  Bell,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  ChartColumn,
  LayoutDashboard,
  ReceiptText,
  Search,
  Settings,
  TableProperties,
  Users,
  Inbox,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  placement: 'top' | 'more'
  end?: boolean
  roles?: Array<'advisor' | 'secretary'>
  moreGroup?: string
  menuLabel?: string
}

export interface NavGroup {
  label: string
  key: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'main',
    label: 'ראשי',
    items: [
      { to: '/', label: 'לוח בקרה', icon: LayoutDashboard, end: true, placement: 'top' },
      { to: '/search', label: 'חיפוש', icon: Search, placement: 'top' },
    ],
  },
  {
    key: 'clients',
    label: 'לקוחות',
    items: [{ to: '/clients', label: 'לקוחות', icon: Users, placement: 'top' }],
  },
  {
    key: 'tax-work',
    label: 'עבודת מס',
    items: [
      { to: '/tax/vat', label: 'מע״מ', icon: ClipboardList, placement: 'top' },
      { to: '/tax/advance-payments', label: 'מקדמות', icon: CalendarDays, placement: 'top' },
      { to: '/tax/reports', label: 'דוחות שנתיים', icon: TableProperties, placement: 'top' },
    ],
  },
  {
    key: 'office-ops',
    label: 'מסמכים ותפעול',
    items: [
      { to: '/binders', label: 'קלסרים', icon: Briefcase, placement: 'top' },
      { to: '/work-queue', label: 'עבודה לטיפול', icon: Inbox, placement: 'top' },
      { to: '/tasks', label: 'ניהול משימות', icon: CheckSquare, placement: 'top' },
      { to: '/notifications', label: 'הודעות', icon: Bell, placement: 'top' },
    ],
  },
  {
    key: 'finance',
    label: 'כספים',
    items: [{ to: '/charges', label: 'חיובים', icon: ReceiptText, placement: 'top' }],
  },
  {
    key: 'analytics',
    label: 'ניתוחים',
    items: [
      {
        to: '/reports/advance-payments',
        label: 'גביית מקדמות',
        icon: CalendarDays,
        placement: 'more',
        moreGroup: 'מס',
      },
      {
        to: '/reports/annual-status',
        label: 'סטטוס דוחות שנתיים',
        icon: TableProperties,
        placement: 'more',
        moreGroup: 'מס',
      },
      { to: '/reports/aging', label: 'גיול חובות', icon: ChartColumn, placement: 'more', moreGroup: 'ניהול' },
      {
        to: '/reports/vat-compliance',
        label: 'ציות מע"מ',
        icon: ClipboardList,
        placement: 'more',
        moreGroup: 'ניהול',
        menuLabel: 'דוחות ניתוח',
      },
    ],
  },
  {
    key: 'settings',
    label: 'ניהול',
    items: [
      {
        to: '/settings/users',
        label: 'משתמשים',
        icon: Settings,
        roles: ['advisor'],
        placement: 'more',
        moreGroup: 'הגדרות',
      },
      {
        to: '/settings/tax-calendar',
        label: 'הגדרות יומן מס',
        icon: CalendarDays,
        roles: ['advisor'],
        placement: 'more',
        moreGroup: 'הגדרות',
      },
    ],
  },
]
