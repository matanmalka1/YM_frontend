import type { Meta, StoryObj } from '@storybook/react'
import { GroupedPeriodRow } from './GroupedPeriodRow'

const metrics = [
  { label: 'הושלמו', value: 12, tone: 'success' as const },
  { label: 'ממתינים', value: 4, tone: 'warning' as const },
  { label: 'חריגים', value: 1, tone: 'danger' as const },
]

const meta = {
  component: GroupedPeriodRow,
  tags: ['autodocs'],
} satisfies Meta<typeof GroupedPeriodRow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    typeLabel: 'דיווח מע״מ',
    primaryLabel: 'מאי 2026',
    secondaryLabel: 'תקופה דו חודשית',
    relativeDueLabel: 'נותרו 12 ימים',
    metrics,
    ctaLabel: 'פתח',
    children: <div className="p-4 text-sm text-gray-600">פירוט פריטים לתקופה.</div>,
  },
}

export const CurrentPeriod: Story = {
  args: {
    typeLabel: 'דוח שנתי',
    primaryLabel: 'שנת מס 2026',
    relativeDueLabel: 'חודש נוכחי',
    isCurrentPeriod: true,
    metrics,
    ctaLabel: 'פתח',
    children: <div className="p-4 text-sm text-gray-600">פירוט התקופה הנוכחית.</div>,
  },
}

export const Open: Story = {
  args: {
    typeLabel: 'ניכויים',
    primaryLabel: 'אפריל 2026',
    metrics,
    ctaLabel: 'פתח',
    defaultOpen: true,
    children: <div className="p-4 text-sm text-gray-600">התוכן פתוח כברירת מחדל.</div>,
  },
}
