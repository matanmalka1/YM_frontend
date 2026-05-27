import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SearchFilter } from './SearchFilter'

const meta = {
  component: SearchFilter,
  tags: ['autodocs'],
} satisfies Meta<typeof SearchFilter>

export default meta
type Story = StoryObj<typeof meta>

const ControlledSearchFilter = (args: React.ComponentProps<typeof SearchFilter>) => {
  const [value, setValue] = useState(args.externalValue)

  return <SearchFilter {...args} externalValue={value} onChange={(_, nextValue) => setValue(nextValue)} />
}

export const Default: Story = {
  args: {
    field: {
      type: 'search',
      key: 'query',
      label: 'חיפוש',
      placeholder: 'חפש לפי שם או מספר תיק',
    },
    externalValue: '',
    onChange: () => undefined,
  },
  render: (args) => <ControlledSearchFilter {...args} />,
}

export const WithValue: Story = {
  args: {
    field: {
      type: 'search',
      key: 'query',
      label: 'חיפוש',
      placeholder: 'חפש לפי שם או מספר תיק',
    },
    externalValue: 'ישראל',
    onChange: () => undefined,
  },
  render: (args) => <ControlledSearchFilter {...args} />,
}
