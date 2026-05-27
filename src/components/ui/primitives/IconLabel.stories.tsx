import type { Meta, StoryObj } from '@storybook/react-vite'
import { CalendarDays } from 'lucide-react'
import { IconLabel } from './IconLabel'

const meta = {
  component: IconLabel,
  tags: ['autodocs'],
} satisfies Meta<typeof IconLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'ינואר 2026',
  },
}

export const WithIcon: Story = {
  args: {
    icon: <CalendarDays className="h-3.5 w-3.5" />,
    label: '15/01/2026',
  },
}

export const ExtraSmall: Story = {
  args: {
    label: '102',
    size: 'xs',
  },
}

export const Medium: Story = {
  args: {
    label: 'דוח שנתי',
    size: 'md',
  },
}

export const Mono: Story = {
  args: {
    label: 'VAT-2026-01',
    mono: true,
  },
}

export const Bordered: Story = {
  args: {
    label: 'מס הכנסה',
    bordered: true,
  },
}
