import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Button } from '../primitives/Button'
import { Modal } from './Modal'

const meta = {
  component: Modal,
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: false,
    onClose: () => undefined,
    title: 'עריכת לקוח',
    children: <p className="text-sm leading-6 text-gray-600">עדכן את פרטי הלקוח ושמור את השינויים.</p>,
    footer: <Button>שמור</Button>,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מודאל</Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={<Button onClick={() => setOpen(false)}>שמור</Button>}
        />
      </>
    )
  },
}

export const Open: Story = {
  args: {
    open: true,
    onClose: () => undefined,
    title: 'פרטי חיוב',
    children: <p className="text-sm leading-6 text-gray-600">סיכום חיוב חודשי לפני אישור.</p>,
    footer: <Button>אישור</Button>,
  },
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מודאל</Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={<Button onClick={() => setOpen(false)}>אישור</Button>}
        />
      </>
    )
  },
}

export const Dirty: Story = {
  args: {
    open: false,
    onClose: () => undefined,
    title: 'שינויים שלא נשמרו',
    children: <p className="text-sm leading-6 text-gray-600">סגירת המודאל תציג בקשת אישור.</p>,
    footer: <Button>שמור</Button>,
    isDirty: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מודאל</Button>
        <Modal
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={<Button onClick={() => setOpen(false)}>שמור</Button>}
        />
      </>
    )
  },
}
