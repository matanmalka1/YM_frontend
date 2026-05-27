import type { Meta, StoryObj } from '@storybook/react-vite'
import { Checkbox } from './Checkbox'

const meta = {
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'בחר רשומה',
  },
}

export const Checked: Story = {
  args: {
    label: 'כלול בדוח',
    defaultChecked: true,
  },
}

export const WithDescription: Story = {
  args: {
    label: 'שלח התראה',
    description: 'ההתראה תישלח לאחר שמירת השינויים',
  },
}

export const Small: Story = {
  args: {
    label: 'בחירה מהירה',
    size: 'sm',
  },
}

export const Disabled: Story = {
  args: {
    label: 'לא זמין',
    disabled: true,
  },
}

export const DisabledChecked: Story = {
  args: {
    label: 'נעול',
    defaultChecked: true,
    disabled: true,
  },
}

export const InputOnly: Story = {
  args: {
    'aria-label': 'בחר רשומה',
  },
}
