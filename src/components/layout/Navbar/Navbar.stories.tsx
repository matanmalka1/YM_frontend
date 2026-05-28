import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { notificationsQK } from '@/features/notifications'
import { useAuthStore } from '@/store/auth.store'
import { Navbar } from './Navbar'

const createStoryQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  queryClient.setQueryData(notificationsQK.summary(), {
    pending: 3,
    failed: 1,
    sent: 18,
  })

  return queryClient
}

const StoryShell = ({
  children,
  initialPath = '/',
  userRole = 'advisor',
}: {
  children: React.ReactNode
  initialPath?: string
  userRole?: 'advisor' | 'secretary'
}) => {
  const queryClient = createStoryQueryClient()

  useEffect(() => {
    useAuthStore.setState({
      user: { id: 1, full_name: 'דנה כהן', role: userRole, email: 'dana@example.com' },
      isLoading: false,
      hasBootstrapped: true,
      error: null,
    })
  }, [userRole])

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )
}

const meta = {
  component: Navbar,
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>

export default meta
type Story = StoryObj<typeof meta>

export const Advisor: Story = {
  render: () => (
    <StoryShell>
      <Navbar />
    </StoryShell>
  ),
}

export const Secretary: Story = {
  render: () => (
    <StoryShell userRole="secretary">
      <Navbar />
    </StoryShell>
  ),
}

export const ActiveMoreItem: Story = {
  render: () => (
    <StoryShell initialPath="/reports/aging">
      <Navbar />
    </StoryShell>
  ),
}
