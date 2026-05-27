import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'שמור',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    children: 'ביטול',
    variant: 'secondary',
  },
}

export const Outline: Story = {
  args: {
    children: 'ייצוא',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'סגור',
    variant: 'ghost',
  },
}

export const Danger: Story = {
  args: {
    children: 'מחק',
    variant: 'danger',
  },
}

export const Small: Story = {
  args: {
    children: 'עדכן',
    size: 'sm',
  },
}

export const Disabled: Story = {
  args: {
    children: 'שמור',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: 'שומר',
    isLoading: true,
    loadingLabel: 'שומר...',
  },
}

export const FullWidth: Story = {
  args: {
    children: 'המשך',
    fullWidth: true,
  },
}

export const WithTooltip: Story = {
  args: {
    children: 'נעול',
    tooltip: 'אין הרשאה לביצוע פעולה זו',
  },
}
