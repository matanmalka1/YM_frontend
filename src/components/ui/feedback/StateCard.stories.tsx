import type { Meta, StoryObj } from '@storybook/react-vite'
import { AlertTriangle, FileText, Inbox, RefreshCw } from 'lucide-react'
import { StateCard } from './StateCard'

const meta = {
  component: StateCard,
  tags: ['autodocs'],
} satisfies Meta<typeof StateCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: Inbox,
    title: 'אין פריטים פתוחים',
    message: 'כל המשימות לטיפול שוטף הושלמו.',
  },
}

export const Illustration: Story = {
  args: {
    icon: FileText,
    title: 'אין דוחות להצגה',
    message: 'דוחות שנתיים חדשים יופיעו כאן לאחר יצירה.',
    variant: 'illustration',
  },
}

export const Minimal: Story = {
  args: {
    icon: Inbox,
    message: 'אין תוצאות מתאימות לסינון הנוכחי.',
    variant: 'minimal',
    size: 'compact',
  },
}

export const Error: Story = {
  args: {
    icon: AlertTriangle,
    title: 'טעינת הנתונים נכשלה',
    message: 'לא ניתן היה לטעון את רשימת הלקוחות.',
    variant: 'error',
  },
}

export const WithAction: Story = {
  args: {
    icon: RefreshCw,
    title: 'נדרש רענון',
    message: 'המידע בדף אינו עדכני.',
    action: {
      label: 'רענן',
      onClick: () => undefined,
    },
  },
}

export const WithActions: Story = {
  args: {
    icon: FileText,
    title: 'אין מסמכים',
    message: 'ניתן להעלות מסמך חדש או לחזור לרשימת הלקוחות.',
    action: {
      label: 'העלה מסמך',
      onClick: () => undefined,
    },
    secondaryAction: {
      label: 'חזור',
      onClick: () => undefined,
    },
  },
}

export const WithDetails: Story = {
  args: {
    icon: AlertTriangle,
    title: 'שגיאת שרת',
    message: 'אירעה שגיאה בעת טעינת הנתונים.',
    variant: 'error',
    details: 'GET /api/v1/clients failed with status 500',
  },
}

export const Compact: Story = {
  args: {
    icon: Inbox,
    title: 'אין נתונים',
    message: 'לא קיימים פריטים להצגה.',
    size: 'compact',
  },
}
