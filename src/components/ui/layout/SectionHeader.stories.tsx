import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../primitives/Button'
import { SectionHeader } from './SectionHeader'

const meta = {
  component: SectionHeader,
  tags: ['autodocs'],
} satisfies Meta<typeof SectionHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'לקוחות',
  },
}

export const WithSubtitle: Story = {
  args: {
    title: 'לקוחות',
    subtitle: 'ניהול רשימת הלקוחות והתיקים הפעילים.',
  },
}

export const WithActions: Story = {
  args: {
    title: 'מסמכים',
    subtitle: 'מסמכים שהתקבלו וממתינים לטיפול.',
    actions: <Button size="sm">הוסף מסמך</Button>,
  },
}

export const ExtraSmall: Story = {
  args: {
    title: 'פרטים כלליים',
    size: 'xs',
  },
}

export const Medium: Story = {
  args: {
    title: 'דוחות שנתיים',
    subtitle: 'מעקב אחר דוחות פתוחים לשנת המס.',
    size: 'md',
  },
}

export const Large: Story = {
  args: {
    title: 'לוח בקרה',
    subtitle: 'תמונת מצב תפעולית לפי לקוחות, תיקים ומשימות.',
    size: 'lg',
  },
}

export const WithBottomBorder: Story = {
  args: {
    title: 'חיובים',
    subtitle: 'סיכום חיובים לחודש הנוכחי.',
    border: 'bottom',
  },
}
