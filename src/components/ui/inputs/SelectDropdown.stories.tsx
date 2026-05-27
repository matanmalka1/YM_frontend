import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SelectDropdown } from './SelectDropdown'

const options = [
  { value: 'active', label: 'פעיל' },
  { value: 'pending', label: 'ממתין למסמכים' },
  { value: 'archived', label: 'ארכיון', disabled: true },
]

const meta = {
  component: SelectDropdown,
  tags: ['autodocs'],
} satisfies Meta<typeof SelectDropdown>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    options,
  },
}

export const WithValue: Story = {
  args: {
    options,
  },
  render: (args) => {
    const [value, setValue] = useState('active')
    return <SelectDropdown {...args} value={value} onChange={(event) => setValue(event.target.value)} />
  },
}

export const ExtraSmall: Story = {
  args: {
    options,
    size: 'xs',
  },
}

export const Small: Story = {
  args: {
    options,
    size: 'sm',
  },
}

export const Disabled: Story = {
  args: {
    options,
    value: 'active',
    disabled: true,
  },
}
