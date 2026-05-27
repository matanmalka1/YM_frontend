import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from './FormField'

const meta = {
  component: FormField,
  tags: ['autodocs'],
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'שם לקוח',
    children: (
      <input
        className="h-9 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="ישראל ישראלי"
      />
    ),
  },
}

export const Error: Story = {
  args: {
    label: 'מספר תיק',
    error: 'מספר תיק הוא שדה חובה',
    children: (
      <input
        className="h-9 w-full rounded-lg border border-negative-500 px-3 py-2 text-sm shadow-sm focus:border-negative-500 focus:outline-none focus:ring-2 focus:ring-negative-200"
        placeholder="BN-1024"
      />
    ),
  },
}

export const WithoutLabel: Story = {
  args: {
    children: (
      <input
        aria-label="חיפוש"
        className="h-9 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="חיפוש"
      />
    ),
  },
}

export const CustomLabelClass: Story = {
  args: {
    label: 'תאריך יעד',
    labelClassName: 'text-primary-700',
    children: (
      <input
        className="h-9 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="15/01/2026"
      />
    ),
  },
}
