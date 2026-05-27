import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PasswordInput } from './PasswordInput'

const meta = {
  component: PasswordInput,
  tags: ['autodocs'],
} satisfies Meta<typeof PasswordInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'סיסמה',
  },
}

export const WithLabel: Story = {
  args: {
    label: 'סיסמה',
    placeholder: 'הזן סיסמה',
  },
}

export const WithValue: Story = {
  args: {
    label: 'סיסמה',
  },
  render: (args) => {
    const [value, setValue] = useState('secure-password')
    return <PasswordInput {...args} value={value} onChange={(event) => setValue(event.target.value)} />
  },
}

export const Error: Story = {
  args: {
    label: 'סיסמה',
    value: '123',
    error: 'הסיסמה קצרה מדי',
  },
}

export const Small: Story = {
  args: {
    placeholder: 'סיסמה',
    size: 'sm',
  },
}

export const Disabled: Story = {
  args: {
    label: 'סיסמה',
    value: 'locked-password',
    disabled: true,
  },
}
