import type { Meta, StoryObj } from '@storybook/react-vite'
import { SectionHeader } from './SectionHeader'
import { PageStateGuard } from './PageStateGuard'

const header = <SectionHeader title="לקוחות" subtitle="ניהול לקוחות ותיקים פעילים." />

const meta = {
  component: PageStateGuard,
  tags: ['autodocs'],
} satisfies Meta<typeof PageStateGuard>

export default meta
type Story = StoryObj<typeof meta>

export const Loaded: Story = {
  args: {
    isLoading: false,
    error: null,
    header,
    children: <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">תוכן הדף נטען.</div>,
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
    error: null,
    header,
    loadingMessage: 'טוען לקוחות...',
    children: <div />,
  },
}

export const Error: Story = {
  args: {
    isLoading: false,
    error: 'טעינת הנתונים נכשלה.',
    header,
    children: <div />,
  },
}
