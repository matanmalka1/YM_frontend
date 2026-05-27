import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'
import { GroupSection } from './GroupSection'

const meta = {
  component: GroupSection,
  tags: ['autodocs'],
} satisfies Meta<typeof GroupSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'לקוחות לטיפול',
    children: <div className="p-4 text-sm text-gray-600">רשימת משימות פתוחות לפי לקוח.</div>,
  },
}

export const WithCount: Story = {
  args: {
    label: 'מסמכים חסרים',
    count: 8,
    countLabel: 'פריטים',
    children: <div className="p-4 text-sm text-gray-600">מסמכים שממתינים להשלמה.</div>,
  },
}

export const WithMeta: Story = {
  args: {
    label: 'דוחות שנתיים',
    meta: <Badge variant="warning">דורש בדיקה</Badge>,
    children: <div className="p-4 text-sm text-gray-600">דוחות עם חריגות או נתונים חסרים.</div>,
  },
}

export const Collapsible: Story = {
  args: {
    label: 'תיקי לקוחות',
    count: 4,
    collapsible: true,
    children: <div className="p-4 text-sm text-gray-600">תוכן הקבוצה ניתן לקיפול.</div>,
  },
}

export const Collapsed: Story = {
  args: {
    label: 'ארכיון',
    count: 12,
    collapsible: true,
    defaultExpanded: false,
    children: <div className="p-4 text-sm text-gray-600">רשומות שהועברו לארכיון.</div>,
  },
}
