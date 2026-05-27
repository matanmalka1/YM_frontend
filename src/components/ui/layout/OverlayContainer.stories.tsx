import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '../primitives/Button'
import { OverlayContainer } from './OverlayContainer'

const meta = {
  component: OverlayContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof OverlayContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Modal: Story = {
  args: {
    open: false,
    variant: 'modal',
    title: 'פרטי פעולה',
    children: <p className="text-sm text-gray-600">תוכן מודאל לדוגמה.</p>,
    onClose: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מודאל</Button>
        <OverlayContainer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={<Button onClick={() => setOpen(false)}>סגור</Button>}
        />
      </>
    )
  },
}

export const Drawer: Story = {
  args: {
    open: false,
    variant: 'drawer',
    title: 'פרטי לקוח',
    subtitle: 'ישראל ישראלי',
    children: <p className="text-sm text-gray-600">תוכן מגירה לדוגמה.</p>,
    onClose: () => undefined,
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מגירה</Button>
        <OverlayContainer {...args} open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
}

export const Dialog: Story = {
  args: {
    open: false,
    variant: 'dialog',
    children: (
      <div className="space-y-3 text-right">
        <h3 className="text-base font-semibold text-gray-900">אישור פעולה</h3>
        <p className="text-sm text-gray-600">האם להמשיך?</p>
      </div>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח דיאלוג</Button>
        <OverlayContainer {...args} open={open}>
          <div className="space-y-3 text-right">
            <h3 className="text-base font-semibold text-gray-900">אישור פעולה</h3>
            <p className="text-sm text-gray-600">האם להמשיך?</p>
            <Button size="sm" onClick={() => setOpen(false)}>
              סגור
            </Button>
          </div>
        </OverlayContainer>
      </>
    )
  },
}

export const OpenModal: Story = {
  args: {
    open: true,
    variant: 'modal',
    title: 'מודאל פתוח',
    children: <p className="text-sm text-gray-600">מצב פתוח כברירת מחדל.</p>,
    footer: <Button>אישור</Button>,
    onClose: () => undefined,
  },
}
