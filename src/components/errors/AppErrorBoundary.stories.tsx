import type { Meta, StoryObj } from '@storybook/react'
import { AppErrorBoundary } from './AppErrorBoundary'

const BrokenComponent = () => {
  throw new Error('Storybook error boundary example')
}

const meta = {
  component: AppErrorBoundary,
  tags: ['autodocs'],
} satisfies Meta<typeof AppErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

export const Normal: Story = {
  args: {
    children: <p className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">התוכן נטען ללא שגיאה.</p>,
  },
}

export const ErrorState: Story = {
  args: {
    children: <BrokenComponent />,
  },
}
