import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '../primitives/Button'
import { ConfirmDialog } from './ConfirmDialog'

const meta = {
  component: ConfirmDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: false,
    title: 'לאשר פעולה?',
    message: 'הפעולה תעדכן את סטטוס הלקוח.',
    confirmLabel: 'אישור',
    cancelLabel: 'ביטול',
    onConfirm: () => undefined,
    onCancel: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח אישור</Button>
        <ConfirmDialog {...args} open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </>
    )
  },
}

export const Danger: Story = {
  args: {
    open: false,
    title: 'למחוק רשומה?',
    message: 'לא ניתן לשחזר רשומה לאחר מחיקה.',
    confirmLabel: 'מחק',
    confirmVariant: 'danger',
    onConfirm: () => undefined,
    onCancel: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button variant="danger" onClick={() => setOpen(true)}>
          מחק
        </Button>
        <ConfirmDialog {...args} open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </>
    )
  },
}

export const Loading: Story = {
  args: {
    open: false,
    title: 'שומר שינויים',
    message: 'הפעולה מתבצעת כעת.',
    confirmLabel: 'שומר',
    isLoading: true,
    onConfirm: () => undefined,
    onCancel: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח אישור</Button>
        <ConfirmDialog {...args} open={open} onCancel={() => setOpen(false)} onConfirm={() => undefined} />
      </>
    )
  },
}

export const ConfirmDisabled: Story = {
  args: {
    open: false,
    title: 'פעולה חסומה',
    message: 'חסרים נתונים לפני שניתן להמשיך.',
    confirmDisabled: true,
    onConfirm: () => undefined,
    onCancel: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח אישור</Button>
        <ConfirmDialog {...args} open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </>
    )
  },
}

export const WithDetails: Story = {
  args: {
    open: false,
    title: 'לאשר שליחה?',
    message: 'ההודעה תישלח ללקוח.',
    children: <p className="mt-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">לקוח: ישראל ישראלי</p>,
    onConfirm: () => undefined,
    onCancel: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח אישור</Button>
        <ConfirmDialog {...args} open={open} onCancel={() => setOpen(false)} onConfirm={() => setOpen(false)} />
      </>
    )
  },
}
