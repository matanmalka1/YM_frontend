import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Badge } from '../primitives/Badge'
import { FilterPanel, type FilterFieldDef } from './FilterPanel'

const fields: FilterFieldDef[] = [
  {
    type: 'select',
    key: 'status',
    label: 'סטטוס',
    options: [
      { value: '', label: 'הכל' },
      { value: 'active', label: 'פעיל' },
      { value: 'pending', label: 'ממתין' },
    ],
  },
  {
    type: 'date',
    key: 'due_date',
    label: 'תאריך יעד',
  },
]

const meta = {
  component: FilterPanel,
  tags: ['autodocs'],
} satisfies Meta<typeof FilterPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    fields,
    values: {},
    onChange: () => undefined,
    onReset: () => undefined,
  },
  render: (args) => {
    const [values, setValues] = useState<Record<string, string>>({})
    return (
      <FilterPanel
        {...args}
        values={values}
        onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setValues({})}
      />
    )
  },
}

export const WithValues: Story = {
  args: {
    fields,
    values: {
      status: 'active',
      due_date: '2026-05-27',
    },
    onChange: () => undefined,
    onReset: () => undefined,
  },
  render: (args) => {
    const [values, setValues] = useState<Record<string, string>>(args.values)
    return (
      <FilterPanel
        {...args}
        values={values}
        onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setValues({})}
      />
    )
  },
}

export const WithAboveAndExtraBadge: Story = {
  args: {
    fields,
    values: {
      status: 'pending',
    },
    above: (
      <div className="flex gap-2">
        <Badge variant="info">24 תוצאות</Badge>
        <Badge variant="warning">3 דחופים</Badge>
      </div>
    ),
    extraBadges: [{ key: 'extra', label: 'תצוגה מותאמת', onRemove: () => undefined }],
    onChange: () => undefined,
    onReset: () => undefined,
  },
  render: (args) => {
    const [values, setValues] = useState<Record<string, string>>(args.values)
    return (
      <FilterPanel
        {...args}
        values={values}
        onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
        onReset={() => setValues({})}
      />
    )
  },
}
