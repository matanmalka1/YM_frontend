import type { Meta, StoryObj } from '@storybook/react-vite'
import { Mail, Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../primitives/Button'
import { Input } from './Input'

const meta = {
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'שם לקוח',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'שם לקוח',
    placeholder: 'ישראל ישראלי',
  },
}

export const WithValue: Story = {
  args: {
    label: 'אימייל',
    placeholder: 'client@example.com',
  },
  render: (args) => {
    const [value, setValue] = useState('client@example.com')
    return <Input {...args} value={value} onChange={(event) => setValue(event.target.value)} />
  },
}

export const Error: Story = {
  args: {
    label: 'מספר תיק',
    value: '',
    error: 'שדה חובה',
    placeholder: 'BN-1024',
  },
}

export const Disabled: Story = {
  args: {
    label: 'מספר לקוח',
    value: 'CL-2048',
    disabled: true,
  },
}

export const ExtraSmall: Story = {
  args: {
    placeholder: 'חיפוש',
    size: 'xs',
  },
}

export const Small: Story = {
  args: {
    placeholder: 'חיפוש',
    size: 'sm',
  },
}

export const WithStartIcon: Story = {
  args: {
    label: 'חיפוש',
    placeholder: 'חפש לפי שם או מספר תיק',
    startIcon: <Search className="h-4 w-4" />,
  },
}

export const WithEndIcon: Story = {
  args: {
    label: 'אימייל',
    placeholder: 'client@example.com',
    endIcon: <Mail className="h-4 w-4" />,
  },
}

export const WithEndElement: Story = {
  args: {
    label: 'קוד אימות',
    placeholder: '123456',
    endElement: (
      <Button type="button" size="sm" variant="ghost">
        שלח
      </Button>
    ),
  },
}
