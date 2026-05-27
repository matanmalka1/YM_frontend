import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ClientPickerFilter } from './ClientPickerFilter'

const meta = {
  component: ClientPickerFilter,
  tags: ['autodocs'],
} satisfies Meta<typeof ClientPickerFilter>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    field: {
      type: 'client-picker',
      idKey: 'client_id',
      nameKey: 'client_name',
      label: 'לקוח',
      placeholder: 'חפש לקוח',
    },
    values: {},
    onMultiChange: () => undefined,
  },
  render: (args) => {
    const [values, setValues] = useState<Record<string, string>>({})
    return (
      <ClientPickerFilter
        {...args}
        values={values}
        onMultiChange={(updates) => setValues((prev) => ({ ...prev, ...updates }))}
      />
    )
  },
}

export const Selected: Story = {
  args: {
    field: {
      type: 'client-picker',
      idKey: 'client_id',
      nameKey: 'client_name',
      label: 'לקוח',
      placeholder: 'חפש לקוח',
    },
    values: {
      client_id: '1024',
      client_name: 'ישראל ישראלי',
    },
    onMultiChange: () => undefined,
  },
  render: (args) => {
    const [values, setValues] = useState<Record<string, string>>(args.values)
    return (
      <ClientPickerFilter
        {...args}
        values={values}
        onMultiChange={(updates) => setValues((prev) => ({ ...prev, ...updates }))}
      />
    )
  },
}
