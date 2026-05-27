import type { Meta, StoryObj } from '@storybook/react-vite'
import { TableSkeleton } from './TableSkeleton'

const meta = {
  component: TableSkeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof TableSkeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Compact: Story = {
  args: {
    rows: 3,
    columns: 4,
  },
}

export const Wide: Story = {
  args: {
    rows: 5,
    columns: 8,
  },
}
