import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { Button } from '../ui/primitives/Button'
import { PageHeader } from './PageHeader'

const meta = {
  component: PageHeader,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'לקוחות',
  },
}

export const WithDescription: Story = {
  args: {
    title: 'לקוחות',
    description: 'ניהול רשימת הלקוחות והתיקים הפעילים.',
  },
}

export const WithBreadcrumbs: Story = {
  args: {
    title: 'פרטי לקוח',
    description: 'סקירת פרטי לקוח ופעילות שוטפת.',
    breadcrumbs: [
      { label: 'לקוחות', to: '/clients' },
      { label: 'ישראל ישראלי', to: '/clients/1024' },
    ],
  },
}

export const WithActions: Story = {
  args: {
    title: 'דוחות שנתיים',
    description: 'מעקב אחר עונת הדוחות.',
    actions: (
      <>
        <Button variant="outline">ייצוא</Button>
        <Button>דוח חדש</Button>
      </>
    ),
  },
}

export const Medium: Story = {
  args: {
    title: 'מסמכים',
    description: 'מסמכים שהתקבלו מהלקוח.',
    size: 'md',
  },
}
