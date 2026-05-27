import type { Meta, StoryObj } from '@storybook/react-vite'
import { Edit, Eye, Trash2 } from 'lucide-react'
import { RowActionItem, RowActionLink, RowActionSeparator, RowActionsMenu } from './RowActions'

const meta = {
  component: RowActionsMenu,
  tags: ['autodocs'],
} satisfies Meta<typeof RowActionsMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ariaLabel: 'פעולות רשומה',
    children: (
      <>
        <RowActionItem label="צפה" icon={<Eye className="h-4 w-4" />} onClick={() => undefined} />
        <RowActionItem label="ערוך" icon={<Edit className="h-4 w-4" />} onClick={() => undefined} />
        <RowActionSeparator />
        <RowActionItem label="מחק" icon={<Trash2 className="h-4 w-4" />} danger onClick={() => undefined} />
      </>
    ),
  },
}

export const WithDisabledItem: Story = {
  args: {
    ariaLabel: 'פעולות רשומה',
    children: (
      <>
        <RowActionItem label="צפה" icon={<Eye className="h-4 w-4" />} onClick={() => undefined} />
        <RowActionItem
          label="ערוך"
          icon={<Edit className="h-4 w-4" />}
          disabled
          tooltip="אין הרשאה לעריכה"
          onClick={() => undefined}
        />
      </>
    ),
  },
}

export const WithLink: Story = {
  args: {
    ariaLabel: 'פעולות רשומה',
    children: (
      <>
        <RowActionLink href="#client" label="פתח לקוח" icon={<Eye className="h-4 w-4" />} />
        <RowActionItem label="ערוך" icon={<Edit className="h-4 w-4" />} onClick={() => undefined} />
      </>
    ),
  },
}
