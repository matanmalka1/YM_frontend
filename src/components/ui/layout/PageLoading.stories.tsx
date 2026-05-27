import type { Meta, StoryObj } from '@storybook/react'
import { PageLoading } from './PageLoading'

const meta = {
  component: PageLoading,
  tags: ['autodocs'],
} satisfies Meta<typeof PageLoading>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const CustomMessage: Story = {
  args: {
    message: 'טוען רשימת לקוחות...',
  },
}

export const CompactTable: Story = {
  args: {
    rows: 2,
    columns: 3,
  },
}

export const WideTable: Story = {
  args: {
    rows: 4,
    columns: 6,
  },
}
