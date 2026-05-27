import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Select } from './Select'

const clientStatusOptions = [
  { value: 'active', label: 'פעיל' },
  { value: 'pending', label: 'ממתין למסמכים' },
  { value: 'archived', label: 'ארכיון', disabled: true },
]

const meta = {
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Native: Story = {
  args: {
    label: 'סטטוס לקוח',
    defaultValue: 'active',
    children: (
      <>
        <option value="active">פעיל</option>
        <option value="pending">ממתין למסמכים</option>
        <option value="archived">ארכיון</option>
      </>
    ),
  },
}

export const Dropdown: Story = {
  args: {
    label: 'סטטוס לקוח',
    options: clientStatusOptions,
  },
}

export const WithValue: Story = {
  args: {
    label: 'סטטוס לקוח',
    options: clientStatusOptions,
  },
  render: (args) => {
    const [value, setValue] = useState('active')
    return <Select {...args} value={value} onChange={(event) => setValue(event.target.value)} />
  },
}

export const Error: Story = {
  args: {
    label: 'סטטוס לקוח',
    options: clientStatusOptions,
    value: '',
    error: 'יש לבחור סטטוס',
  },
}

export const ExtraSmall: Story = {
  args: {
    options: clientStatusOptions,
    size: 'xs',
  },
}

export const Small: Story = {
  args: {
    options: clientStatusOptions,
    size: 'sm',
  },
}

export const Disabled: Story = {
  args: {
    label: 'סטטוס לקוח',
    options: clientStatusOptions,
    value: 'active',
    disabled: true,
  },
}
