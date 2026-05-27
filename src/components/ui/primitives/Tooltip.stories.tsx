import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { Tooltip } from './Tooltip'

const meta = {
  component: Tooltip,
  tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: 'פרטים נוספים',
    children: <Button variant="outline">רחף להצגה</Button>,
  },
}

export const TextTrigger: Story = {
  args: {
    text: 'מספר תיק פנימי',
    children: <span className="cursor-help border-b border-dotted border-gray-400 text-sm text-gray-700">BN-1024</span>,
  },
}

export const CustomClassName: Story = {
  args: {
    text: 'פעולה זמינה ליועץ בלבד',
    children: <Button variant="secondary">בדיקת הרשאות</Button>,
    className: 'm-8',
  },
}
