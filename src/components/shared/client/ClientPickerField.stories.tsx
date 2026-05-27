import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ClientPickerField } from './ClientPickerField'

const meta = {
  component: ClientPickerField,
  tags: ['autodocs'],
} satisfies Meta<typeof ClientPickerField>

export default meta
type Story = StoryObj<typeof meta>

const ControlledClientPickerField = (args: React.ComponentProps<typeof ClientPickerField>) => {
  const [clientQuery, setClientQuery] = useState(args.clientQuery)
  const [selectedClient, setSelectedClient] = useState(args.selectedClient)

  return (
    <ClientPickerField
      {...args}
      clientQuery={clientQuery}
      selectedClient={selectedClient}
      onQueryChange={(query) => {
        setClientQuery(query)
        setSelectedClient(null)
      }}
      onSelect={(client) => {
        setSelectedClient(client)
        setClientQuery(client.name)
      }}
      onClear={() => {
        setSelectedClient(null)
        setClientQuery('')
      }}
    />
  )
}

export const Empty: Story = {
  args: {
    selectedClient: null,
    clientQuery: '',
    onQueryChange: () => undefined,
    onSelect: () => undefined,
    onClear: () => undefined,
  },
  render: (args) => <ControlledClientPickerField {...args} />,
}

export const Selected: Story = {
  args: {
    selectedClient: { id: 1024, name: 'ישראל ישראלי' },
    clientQuery: 'ישראל ישראלי',
    onQueryChange: () => undefined,
    onSelect: () => undefined,
    onClear: () => undefined,
  },
  render: (args) => <ControlledClientPickerField {...args} />,
}

export const Error: Story = {
  args: {
    selectedClient: null,
    clientQuery: '',
    error: 'יש לבחור לקוח',
    onQueryChange: () => undefined,
    onSelect: () => undefined,
    onClear: () => undefined,
  },
  render: (args) => <ControlledClientPickerField {...args} />,
}
