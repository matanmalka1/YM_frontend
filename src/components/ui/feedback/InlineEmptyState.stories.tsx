import type { Meta, StoryObj } from '@storybook/react'
import { FileSearch, Inbox } from 'lucide-react'
import { InlineEmptyState } from './InlineEmptyState'

const meta = {
  component: InlineEmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof InlineEmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'אין נתונים להצגה',
  },
}

export const WithDescription: Story = {
  args: {
    title: 'לא נמצאו מסמכים',
    description: 'מסמכים שיועלו ללקוח יופיעו כאן.',
  },
}

export const CustomIcon: Story = {
  args: {
    title: 'אין תוצאות חיפוש',
    description: 'נסה לשנות את מילת החיפוש או את הסינון.',
    icon: FileSearch,
  },
}

export const CustomClassName: Story = {
  args: {
    title: 'תיבה ריקה',
    description: 'אין פריטים שממתינים לטיפול.',
    icon: Inbox,
    className: 'rounded-xl border border-dashed border-gray-200 bg-white',
  },
}
