import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from '../primitives/Badge'
import { DefinitionList } from './DefinitionList'

const items = [
  { label: 'שם לקוח', value: 'ישראל ישראלי' },
  { label: 'מספר תיק', value: 'BN-1024' },
  { label: 'סטטוס', value: <Badge variant="success">פעיל</Badge> },
  { label: 'יועץ', value: 'דנה כהן' },
]

const meta = {
  component: DefinitionList,
  tags: ['autodocs'],
} satisfies Meta<typeof DefinitionList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items,
  },
}

export const OneColumn: Story = {
  args: {
    items,
    columns: 1,
  },
}

export const ThreeColumns: Story = {
  args: {
    items: [
      ...items,
      { label: 'תאריך פתיחה', value: '01/01/2026' },
      { label: 'סוג ישות', value: 'עוסק מורשה' },
    ],
    columns: 3,
  },
}

export const FourColumns: Story = {
  args: {
    items,
    columns: 4,
  },
}

export const Stacked: Story = {
  args: {
    items,
    layout: 'stacked',
  },
}

export const FullWidthItem: Story = {
  args: {
    items: [
      { label: 'שם לקוח', value: 'ישראל ישראלי' },
      { label: 'מספר תיק', value: 'BN-1024' },
      {
        label: 'הערות',
        value: 'הלקוח העביר את כל המסמכים הנדרשים להמשך טיפול.',
        fullWidth: true,
      },
    ],
    columns: 2,
  },
}

export const EmptyValue: Story = {
  args: {
    items: [
      { label: 'שם לקוח', value: 'ישראל ישראלי' },
      { label: 'טלפון', value: null },
    ],
  },
}
