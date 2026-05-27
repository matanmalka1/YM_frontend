import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'

const meta = {
  component: Badge,
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: {
    children: 'פעיל',
    variant: 'neutral',
  },
}

export const Success: Story = {
  args: {
    children: 'הושלם',
    variant: 'success',
  },
}

export const Warning: Story = {
  args: {
    children: 'דורש טיפול',
    variant: 'warning',
  },
}

export const Error: Story = {
  args: {
    children: 'שגיאה',
    variant: 'error',
  },
}

export const Info: Story = {
  args: {
    children: 'מידע',
    variant: 'info',
  },
}

export const ExtraSmall: Story = {
  args: {
    children: 'קטן',
    size: 'xs',
  },
}

export const Medium: Story = {
  args: {
    children: 'בינוני',
    size: 'md',
  },
}

export const Signal: Story = {
  args: {
    children: 'דחוף',
    variant: 'error',
    dot: 'bg-negative-500',
  },
}

export const SignalWithRing: Story = {
  args: {
    children: 'פתוח',
    variant: 'info',
    ring: true,
  },
}

export const Removable: Story = {
  args: {
    children: 'לקוח פעיל',
    removable: true,
    onRemove: () => undefined,
  },
}
