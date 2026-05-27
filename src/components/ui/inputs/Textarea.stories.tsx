import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Textarea } from './Textarea'

const meta = {
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'הוסף הערה',
    rows: 4,
  },
}

export const WithLabel: Story = {
  args: {
    label: 'הערות פנימיות',
    placeholder: 'כתוב הערה לצוות',
    rows: 4,
  },
}

export const WithValue: Story = {
  args: {
    label: 'סיכום טיפול',
    rows: 4,
  },
  render: (args) => {
    const [value, setValue] = useState('הלקוח שלח את כל המסמכים הנדרשים.')
    return <Textarea {...args} value={value} onChange={(event) => setValue(event.target.value)} />
  },
}

export const Error: Story = {
  args: {
    label: 'הערה',
    error: 'יש להזין לפחות 10 תווים',
    value: 'קצר',
    rows: 4,
  },
}

export const Small: Story = {
  args: {
    placeholder: 'הערה קצרה',
    size: 'sm',
    rows: 3,
  },
}

export const Disabled: Story = {
  args: {
    label: 'הערה נעולה',
    value: 'הערה זו אינה ניתנת לעריכה.',
    disabled: true,
    rows: 4,
  },
}
