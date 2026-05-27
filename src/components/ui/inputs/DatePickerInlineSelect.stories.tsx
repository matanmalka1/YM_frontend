import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { DatePickerInlineSelect } from './DatePickerInlineSelect'

const monthOptions = [
  { label: 'ינואר', value: 0 },
  { label: 'פברואר', value: 1 },
  { label: 'מרץ', value: 2 },
  { label: 'אפריל', value: 3 },
]

const meta = {
  component: DatePickerInlineSelect,
  tags: ['autodocs'],
} satisfies Meta<typeof DatePickerInlineSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 0,
    options: monthOptions,
    onChange: () => undefined,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <DatePickerInlineSelect {...args} value={value} onChange={setValue} />
  },
}

export const Selected: Story = {
  args: {
    value: 2,
    options: monthOptions,
    onChange: () => undefined,
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <DatePickerInlineSelect {...args} value={value} onChange={setValue} />
  },
}
