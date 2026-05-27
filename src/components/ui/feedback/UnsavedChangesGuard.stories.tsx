import type { Meta, StoryObj } from '@storybook/react-vite'
import { UnsavedChangesGuard } from './UnsavedChangesGuard'

const meta = {
  component: UnsavedChangesGuard,
  tags: ['autodocs'],
} satisfies Meta<typeof UnsavedChangesGuard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onContinue: () => undefined,
    onDiscard: () => undefined,
  },
}
