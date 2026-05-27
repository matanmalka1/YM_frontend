import type { Meta, StoryObj } from '@storybook/react-vite'
import { BulkSelectionActionButton, BulkSelectionToolbar } from './BulkSelectionToolbar'

const meta = {
  component: BulkSelectionToolbar,
  tags: ['autodocs'],
} satisfies Meta<typeof BulkSelectionToolbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    selectedCount: 3,
    loading: false,
    onClear: () => undefined,
    children: (
      <>
        <BulkSelectionActionButton label="סמן כהושלם" disabled={false} loading={false} onClick={() => undefined} />
        <BulkSelectionActionButton label="מחק" variant="danger" disabled={false} loading={false} onClick={() => undefined} />
      </>
    ),
  },
}

export const Loading: Story = {
  args: {
    selectedCount: 3,
    loading: true,
    onClear: () => undefined,
    children: <BulkSelectionActionButton label="מעדכן" disabled={false} loading onClick={() => undefined} />,
  },
}

export const WithExtra: Story = {
  args: {
    selectedCount: 5,
    loading: false,
    onClear: () => undefined,
    extra: <p className="text-xs text-primary-700">הפעולה תחול על כל הרשומות שנבחרו.</p>,
    children: <BulkSelectionActionButton label="שלח תזכורת" disabled={false} loading={false} onClick={() => undefined} />,
  },
}
