import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DatePicker } from './DatePicker'

const meta = {
  component: DatePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'תאריך יעד',
  },
  render: (args) => {
    const [value, setValue] = useState('')
    return <DatePicker {...args} value={value} onChange={setValue} />
  },
}

export const WithValue: Story = {
  args: {
    label: 'תאריך יעד',
  },
  render: (args) => {
    const [value, setValue] = useState('2026-01-15')
    return <DatePicker {...args} value={value} onChange={setValue} />
  },
}

export const Error: Story = {
  args: {
    label: 'תאריך יעד',
    error: 'יש לבחור תאריך',
  },
  render: (args) => {
    const [value, setValue] = useState('')
    return <DatePicker {...args} value={value} onChange={setValue} />
  },
}

export const Compact: Story = {
  args: {
    compact: true,
    noWrapper: true,
  },
  render: (args) => {
    const [value, setValue] = useState('2026-02-19')
    return <DatePicker {...args} value={value} onChange={setValue} />
  },
}

export const Disabled: Story = {
  args: {
    label: 'תאריך יעד',
    value: '2026-01-15',
    disabled: true,
  },
}

export const WithMaxDate: Story = {
  args: {
    label: 'תאריך הגשה',
    maxDate: new Date('2026-12-31'),
  },
  render: (args) => {
    const [value, setValue] = useState('2026-05-27')
    return <DatePicker {...args} value={value} onChange={setValue} />
  },
}

export const WithoutPortal: Story = {
  args: {
    label: 'תאריך',
    usePortal: false,
  },
  render: (args) => {
    const [value, setValue] = useState('')
    return <DatePicker {...args} value={value} onChange={setValue} />
  },
}
