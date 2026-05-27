import type { Meta, StoryObj } from '@storybook/react'
import { MonoValue } from './MonoValue'

const meta = {
  component: MonoValue,
  tags: ['autodocs'],
} satisfies Meta<typeof MonoValue>

export default meta
type Story = StoryObj<typeof meta>

export const Neutral: Story = {
  args: {
    value: '₪12,450',
    tone: 'neutral',
  },
}

export const Positive: Story = {
  args: {
    value: '₪3,200',
    tone: 'positive',
  },
}

export const Negative: Story = {
  args: {
    value: '₪1,850',
    tone: 'negative',
  },
}

export const Warning: Story = {
  args: {
    value: '₪980',
    tone: 'warning',
  },
}

export const Critical: Story = {
  args: {
    value: 124,
    tone: 'critical',
  },
}

export const Empty: Story = {
  args: {
    value: null,
  },
}

export const Days: Story = {
  args: {
    value: 45,
    format: 'days',
  },
}

export const DaysWarning: Story = {
  args: {
    value: 75,
    format: 'days',
  },
}

export const DaysCritical: Story = {
  args: {
    value: 105,
    format: 'days',
  },
}

export const ReturnedDays: Story = {
  args: {
    value: 120,
    format: 'days',
    isInactive: true,
  },
}
