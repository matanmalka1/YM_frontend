import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActiveFilterBadges } from './ActiveFilterBadges'

const meta = {
  component: ActiveFilterBadges,
  tags: ['autodocs'],
} satisfies Meta<typeof ActiveFilterBadges>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    badges: [
      { key: 'status', label: 'פעיל', onRemove: () => undefined },
      { key: 'query', label: 'חיפוש: ישראל', onRemove: () => undefined },
    ],
  },
}

export const WithReset: Story = {
  args: {
    badges: [
      { key: 'status', label: 'פעיל', onRemove: () => undefined },
      { key: 'date', label: 'תאריך: 27/05/2026', onRemove: () => undefined },
    ],
    onReset: () => undefined,
  },
}

export const Empty: Story = {
  args: {
    badges: [],
  },
}
