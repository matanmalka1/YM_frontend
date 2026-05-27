import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ClientSearchInput, SelectedClientDisplay } from './ClientSearchInput'

const meta = {
  component: ClientSearchInput,
  tags: ['autodocs'],
} satisfies Meta<typeof ClientSearchInput>

export default meta
type Story = StoryObj<typeof meta>

const ControlledClientSearchInput = (args: React.ComponentProps<typeof ClientSearchInput>) => {
  const [value, setValue] = useState(args.value)

  return <ClientSearchInput {...args} value={value} onChange={setValue} />
}

export const Default: Story = {
  args: {
    value: '',
    onChange: () => undefined,
    onSelect: () => undefined,
  },
  render: (args) => <ControlledClientSearchInput {...args} />,
}

export const WithValue: Story = {
  args: {
    value: 'ישראל',
    onChange: () => undefined,
    onSelect: () => undefined,
  },
  render: (args) => <ControlledClientSearchInput {...args} />,
}

export const WithHelperText: Story = {
  args: {
    value: '',
    helperText: 'הקלד לפחות שני תווים כדי לחפש לקוח.',
    onChange: () => undefined,
    onSelect: () => undefined,
  },
  render: (args) => <ControlledClientSearchInput {...args} />,
}

export const Error: Story = {
  args: {
    value: '',
    error: 'יש לבחור לקוח',
    onChange: () => undefined,
    onSelect: () => undefined,
  },
  render: (args) => <ControlledClientSearchInput {...args} />,
}

export const SelectedDisplay: Story = {
  args: {
    value: '',
    onChange: () => undefined,
    onSelect: () => undefined,
  },
  render: () => <SelectedClientDisplay name="ישראל ישראלי" id={1024} onClear={() => undefined} />,
}
