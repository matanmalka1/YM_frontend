import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatusBadge } from './StatusBadge'

const statusLabels: Record<string, string> = {
  open: 'פתוח',
  done: 'הושלם',
  blocked: 'חסום',
  waiting: 'ממתין',
}

const variantMap = {
  open: 'info',
  done: 'success',
  blocked: 'error',
  waiting: 'warning',
} as const

const meta = {
  component: StatusBadge,
  tags: ['autodocs'],
} satisfies Meta<typeof StatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    status: 'open',
    getLabel: (status) => statusLabels[status] ?? status,
    variantMap,
  },
}

export const Success: Story = {
  args: {
    status: 'done',
    getLabel: (status) => statusLabels[status] ?? status,
    variantMap,
  },
}

export const Error: Story = {
  args: {
    status: 'blocked',
    getLabel: (status) => statusLabels[status] ?? status,
    variantMap,
  },
}

export const Warning: Story = {
  args: {
    status: 'waiting',
    getLabel: (status) => statusLabels[status] ?? status,
    variantMap,
  },
}

export const DefaultVariant: Story = {
  args: {
    status: 'archived',
    getLabel: (status) => statusLabels[status] ?? status,
    variantMap,
    defaultVariant: 'neutral',
  },
}

export const Small: Story = {
  args: {
    status: 'open',
    getLabel: (status) => statusLabels[status] ?? status,
    variantMap,
    size: 'xs',
  },
}

export const Medium: Story = {
  args: {
    status: 'done',
    getLabel: (status) => statusLabels[status] ?? status,
    variantMap,
    size: 'md',
  },
}
