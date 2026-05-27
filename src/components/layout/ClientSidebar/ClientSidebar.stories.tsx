import type { Meta, StoryObj } from '@storybook/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { clientsQK } from '@/features/clients'
import { useAuthStore } from '@/store/auth.store'
import { CLIENT_SIDEBAR_PAGE_SIZE } from './useClientSidebarClients'
import { ClientSidebar } from './ClientSidebar'

const sidebarParams = {
  page: 1,
  page_size: CLIENT_SIDEBAR_PAGE_SIZE,
  sort_by: 'full_name',
  sort_order: 'asc',
  search: undefined,
}

const sidebarClients = [
  {
    id: 1024,
    full_name: 'ישראל ישראלי',
    office_client_number: 1024,
    phone: '0501234567',
    email: 'israel@example.com',
    entity_type: 'osek_murshe',
    vat_reporting_frequency: 'monthly',
  },
  {
    id: 1025,
    full_name: 'רות לוי',
    office_client_number: 1025,
    phone: '0527654321',
    email: 'rut@example.com',
    entity_type: 'company_ltd',
    vat_reporting_frequency: 'bimonthly',
  },
  {
    id: 1026,
    full_name: 'כהן ייעוץ בע״מ',
    office_client_number: 1026,
    phone: null,
    email: 'office@example.com',
    entity_type: 'company_ltd',
    vat_reporting_frequency: 'monthly',
  },
]

const createStoryQueryClient = ({
  empty = false,
  total = sidebarClients.length,
}: {
  empty?: boolean
  total?: number
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  queryClient.setQueryData(clientsQK.sidebar(sidebarParams), {
    items: empty ? [] : sidebarClients,
    page: 1,
    page_size: CLIENT_SIDEBAR_PAGE_SIZE,
    total: empty ? 0 : total,
  })

  return queryClient
}

const ClientSidebarStory = ({
  empty = false,
  role = 'advisor',
  total,
}: {
  empty?: boolean
  role?: 'advisor' | 'secretary'
  total?: number
}) => {
  const queryClient = createStoryQueryClient({ empty, total })

  useEffect(() => {
    useAuthStore.setState({
      user: { id: 1, full_name: 'דנה כהן', role },
      isLoading: false,
      hasBootstrapped: true,
      error: null,
    })
  }, [role])

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/clients/1024']}>
        <div className="h-screen bg-gray-50" dir="rtl">
          <ClientSidebar />
        </div>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const meta = {
  component: ClientSidebar,
  tags: ['autodocs'],
} satisfies Meta<typeof ClientSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Advisor: Story = {
  render: () => <ClientSidebarStory />,
}

export const Secretary: Story = {
  render: () => <ClientSidebarStory role="secretary" />,
}

export const Empty: Story = {
  render: () => <ClientSidebarStory empty />,
}

export const Truncated: Story = {
  render: () => <ClientSidebarStory total={148} />,
}
