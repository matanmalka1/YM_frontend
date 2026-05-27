import type { Meta, StoryObj } from '@storybook/react'
import { AlertTriangle, CheckCircle2, FileText, Users } from 'lucide-react'
import { StatsCard } from './StatsCard'

const meta = {
  component: StatsCard,
  tags: ['autodocs'],
} satisfies Meta<typeof StatsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'לקוחות פעילים',
    value: 128,
  },
}

export const WithDescription: Story = {
  args: {
    title: 'דוחות פתוחים',
    value: 24,
    description: 'דוחות שנתיים שממתינים להשלמה.',
  },
}

export const WithIcon: Story = {
  args: {
    title: 'לקוחות פעילים',
    value: 128,
    icon: Users,
    variant: 'blue',
  },
}

export const Green: Story = {
  args: {
    title: 'הושלם',
    value: 86,
    icon: CheckCircle2,
    variant: 'green',
  },
}

export const Red: Story = {
  args: {
    title: 'חריגים',
    value: 7,
    icon: AlertTriangle,
    variant: 'red',
  },
}

export const Orange: Story = {
  args: {
    title: 'ממתין לטיפול',
    value: 19,
    icon: FileText,
    variant: 'orange',
  },
}

export const Purple: Story = {
  args: {
    title: 'בקשות חתימה',
    value: 12,
    icon: FileText,
    variant: 'purple',
  },
}

export const WithTrend: Story = {
  args: {
    title: 'גבייה חודשית',
    value: '₪42,300',
    description: 'לעומת החודש הקודם',
    trend: {
      value: 8.4,
      label: 'עלייה',
    },
    variant: 'green',
  },
}

export const WithNegativeTrend: Story = {
  args: {
    title: 'משימות פתוחות',
    value: 31,
    trend: {
      value: -12.5,
      label: 'ירידה',
    },
    variant: 'red',
  },
}

export const WithProgress: Story = {
  args: {
    title: 'התקדמות דוחות',
    value: '68%',
    description: 'דוחות שהושלמו מתוך כלל הדוחות.',
    progress: 68,
    variant: 'blue',
  },
}

export const Selected: Story = {
  args: {
    title: 'נבחר',
    value: 14,
    selected: true,
    variant: 'neutral',
  },
}

export const Interactive: Story = {
  args: {
    title: 'לחץ לסינון',
    value: 9,
    actionLabel: 'הצג פריטים',
    onClick: () => undefined,
  },
}

export const Compact: Story = {
  args: {
    title: 'משימות',
    value: 18,
    description: 'פתוחות',
    icon: FileText,
    compact: true,
  },
}
