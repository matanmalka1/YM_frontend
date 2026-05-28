import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { notificationsQK } from '@/features/notifications'
import { useAuthStore } from '@/store/auth.store'
import { NotificationBell } from './NotificationBell'

const createStoryQueryClient = (pending: number, failed: number) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  queryClient.setQueryData(notificationsQK.summary(), {
    pending,
    failed,
    sent: 12,
  })
  queryClient.setQueryData(notificationsQK.list({}), [])

  return queryClient
}

const NotificationBellStory = ({ pending = 3, failed = 1 }: { pending?: number; failed?: number }) => {
  const queryClient = createStoryQueryClient(pending, failed)

  useEffect(() => {
    useAuthStore.setState({
      user: { id: 1, full_name: 'דנה כהן', role: 'advisor', email: 'dana@example.com' },
      isLoading: false,
      hasBootstrapped: true,
      error: null,
    })
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-3">
          <NotificationBell />
        </div>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const meta = {
  component: NotificationBell,
  tags: ['autodocs'],
} satisfies Meta<typeof NotificationBell>

export default meta
type Story = StoryObj<typeof meta>

export const WithBadge: Story = {
  render: () => <NotificationBellStory />,
}

export const Empty: Story = {
  render: () => <NotificationBellStory pending={0} failed={0} />,
}

export const OverflowBadge: Story = {
  render: () => <NotificationBellStory pending={120} failed={4} />,
}
