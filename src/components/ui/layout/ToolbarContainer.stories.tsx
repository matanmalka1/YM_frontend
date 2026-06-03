import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../primitives/Button'
import { Input } from '../inputs/Input'
import { ToolbarContainer } from './ToolbarContainer'

const toolbarContent = (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <Input placeholder="חיפוש לקוח" className="sm:max-w-xs" />
    <div className="flex gap-2">
      <Button variant="outline">נקה</Button>
      <Button>סנן</Button>
    </div>
  </div>
)

const meta = {
  component: ToolbarContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof ToolbarContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: toolbarContent,
  },
}

export const Elevated: Story = {
  args: {
    children: toolbarContent,
    className: 'bg-white shadow-elevation-1',
  },
}

export const CustomClassName: Story = {
  args: {
    children: toolbarContent,
    className: 'border-primary-200 bg-primary-50/40',
  },
}
