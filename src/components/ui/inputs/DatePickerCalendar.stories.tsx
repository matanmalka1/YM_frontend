import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DatePickerCalendar } from './DatePickerCalendar'

const meta = {
  component: DatePickerCalendar,
  tags: ['autodocs'],
} satisfies Meta<typeof DatePickerCalendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    selected: undefined,
    month: new Date('2026-05-01'),
    onMonthChange: () => undefined,
    onSelect: () => undefined,
  },
  render: (args) => {
    const [month, setMonth] = useState(args.month)
    const [selected, setSelected] = useState<Date | undefined>(args.selected)
    return <DatePickerCalendar {...args} month={month} selected={selected} onMonthChange={setMonth} onSelect={setSelected} />
  },
}

export const Selected: Story = {
  args: {
    selected: new Date('2026-05-27'),
    month: new Date('2026-05-01'),
    onMonthChange: () => undefined,
    onSelect: () => undefined,
  },
  render: (args) => {
    const [month, setMonth] = useState(args.month)
    const [selected, setSelected] = useState<Date | undefined>(args.selected)
    return <DatePickerCalendar {...args} month={month} selected={selected} onMonthChange={setMonth} onSelect={setSelected} />
  },
}

export const WithMaxDate: Story = {
  args: {
    selected: new Date('2026-05-15'),
    month: new Date('2026-05-01'),
    maxDate: new Date('2026-05-20'),
    onMonthChange: () => undefined,
    onSelect: () => undefined,
  },
  render: (args) => {
    const [month, setMonth] = useState(args.month)
    const [selected, setSelected] = useState<Date | undefined>(args.selected)
    return <DatePickerCalendar {...args} month={month} selected={selected} onMonthChange={setMonth} onSelect={setSelected} />
  },
}
