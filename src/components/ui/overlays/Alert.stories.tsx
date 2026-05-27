import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Alert } from './Alert'

const meta = {
  component: Alert,
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Warning: Story = {
  args: {
    message: 'חסרים מסמכים להשלמת הטיפול.',
    variant: 'warning',
  },
}

export const Info: Story = {
  args: {
    message: 'הנתונים נשמרו כטיוטה.',
    variant: 'info',
  },
}

export const Error: Story = {
  args: {
    message: 'טעינת הנתונים נכשלה.',
    variant: 'error',
  },
}

export const Success: Story = {
  args: {
    message: 'הפעולה הושלמה בהצלחה.',
    variant: 'success',
  },
}

export const Small: Story = {
  args: {
    message: 'עודכן לפני מספר דקות.',
    size: 'sm',
  },
}

export const Dismissible: Story = {
  args: {
    message: 'ניתן לסגור את ההתראה.',
    dismissible: true,
  },
  render: (args) => {
    const [visible, setVisible] = useState(true)
    return visible ? <Alert {...args} onDismiss={() => setVisible(false)} /> : <></>
  },
}

export const WithRetry: Story = {
  args: {
    message: 'לא ניתן היה לטעון את הרשימה.',
    variant: 'error',
    onRetry: () => undefined,
  },
}
