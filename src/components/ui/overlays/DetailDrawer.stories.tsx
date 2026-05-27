import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Badge } from '../primitives/Badge'
import { Button } from '../primitives/Button'
import { DetailDrawer, DrawerField, DrawerSection } from './DetailDrawer'

const meta = {
  component: DetailDrawer,
  tags: ['autodocs'],
} satisfies Meta<typeof DetailDrawer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: false,
    onClose: () => undefined,
    title: 'פרטי לקוח',
    subtitle: 'ישראל ישראלי',
    children: (
      <DrawerSection title="פרטים כלליים">
        <DrawerField label="מספר תיק" value="BN-1024" />
        <DrawerField label="סטטוס" value={<Badge variant="success">פעיל</Badge>} />
        <DrawerField label="יועץ" value="דנה כהן" />
      </DrawerSection>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מגירה</Button>
        <DetailDrawer {...args} open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
}

export const Open: Story = {
  args: {
    open: true,
    onClose: () => undefined,
    title: 'דוח שנתי',
    subtitle: 'שנת מס 2026',
    children: (
      <DrawerSection title="סטטוס דוח">
        <DrawerField label="שלב" value="איסוף מסמכים" />
        <DrawerField label="תאריך יעד" value="30/04/2026" />
      </DrawerSection>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מגירה</Button>
        <DetailDrawer {...args} open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
}

export const WithFooter: Story = {
  args: {
    open: false,
    onClose: () => undefined,
    title: 'פרטי משימה',
    subtitle: 'מסמכים חסרים',
    children: (
      <DrawerSection title="משימה">
        <DrawerField label="אחראי" value="מזכירות" />
        <DrawerField label="עדיפות" value={<Badge variant="warning">גבוהה</Badge>} />
      </DrawerSection>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מגירה</Button>
        <DetailDrawer
          {...args}
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                ביטול
              </Button>
              <Button onClick={() => setOpen(false)}>שמור</Button>
            </div>
          }
        />
      </>
    )
  },
}

export const Dirty: Story = {
  args: {
    open: false,
    onClose: () => undefined,
    title: 'עריכת פרטים',
    subtitle: 'יש שינויים שלא נשמרו',
    isDirty: true,
    children: (
      <DrawerSection title="פרטים">
        <DrawerField label="שם לקוח" value="ישראל ישראלי" />
        <DrawerField label="סטטוס" value="בטיפול" />
      </DrawerSection>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>פתח מגירה</Button>
        <DetailDrawer {...args} open={open} onClose={() => setOpen(false)} />
      </>
    )
  },
}
