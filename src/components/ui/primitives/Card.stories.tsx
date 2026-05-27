import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'
import { Card } from './Card'

const meta = {
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <p className="text-sm text-gray-600">פרטי לקוח אחרונים וסטטוס טיפול שוטף.</p>,
  },
}

export const WithHeader: Story = {
  args: {
    title: 'כרטיס לקוח',
    subtitle: 'עודכן היום',
    children: <p className="text-sm text-gray-600">תצוגה מרוכזת של נתוני הלקוח.</p>,
  },
}

export const WithActions: Story = {
  args: {
    title: 'מסמכים',
    subtitle: '3 מסמכים ממתינים',
    actions: <Button size="sm">העלה</Button>,
    children: <p className="text-sm text-gray-600">מסמכי לקוח שנדרשים להשלמה.</p>,
  },
}

export const WithFooter: Story = {
  args: {
    title: 'חיוב חודשי',
    children: <p className="text-sm text-gray-600">סיכום חיובים לחודש הנוכחי.</p>,
    footer: <span className="text-xs text-gray-500">עודכן לפני 10 דקות</span>,
  },
}

export const Elevated: Story = {
  args: {
    children: <p className="text-sm text-gray-600">כרטיס עם צל מודגש.</p>,
    variant: 'elevated',
  },
}

export const Interactive: Story = {
  args: {
    children: <p className="text-sm text-gray-600">כרטיס לחיץ לפתיחת פירוט.</p>,
    interactive: true,
  },
}

export const Compact: Story = {
  args: {
    title: 'תמצית',
    children: <p className="text-sm text-gray-600">תוכן צפוף יותר לתצוגות טבלה.</p>,
    size: 'compact',
  },
}
