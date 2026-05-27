import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '../primitives/Badge'
import { MonthlyAccordionGroup, MonthlyAccordionList } from './MonthlyAccordionGroup'

const meta = {
  component: MonthlyAccordionGroup,
  tags: ['autodocs'],
} satisfies Meta<typeof MonthlyAccordionGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'מאי 2026',
    summary: '8 פריטים',
    children: <div className="p-4 text-sm text-gray-600">רשימת פריטים לחודש.</div>,
  },
}

export const CurrentMonth: Story = {
  args: {
    title: 'מאי 2026',
    summary: '8 פריטים',
    isCurrent: true,
    children: <div className="p-4 text-sm text-gray-600">רשימת פריטים לחודש הנוכחי.</div>,
  },
}

export const WithBadges: Story = {
  args: {
    title: 'יוני 2026',
    summary: '5 פריטים',
    badges: <Badge variant="warning">2 דחופים</Badge>,
    defaultOpen: true,
    children: <div className="p-4 text-sm text-gray-600">פריטים עם סטטוס דחוף.</div>,
  },
}

export const ListLoading: Story = {
  args: {
    title: 'טעינה',
    summary: 'טוען',
    children: <div />,
  },
  render: () => <MonthlyAccordionList isLoading>ignored</MonthlyAccordionList>,
}

export const ListEmpty: Story = {
  args: {
    title: 'ריק',
    summary: 'אין פריטים',
    children: <div />,
  },
  render: () => <MonthlyAccordionList isEmpty>ignored</MonthlyAccordionList>,
}
