import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PaginationCard } from './PaginationCard'

const meta = {
  component: PaginationCard,
  tags: ['autodocs'],
} satisfies Meta<typeof PaginationCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    page: 1,
    totalPages: 5,
    total: 124,
    onPageChange: () => undefined,
  },
  render: (args) => {
    const [page, setPage] = useState(args.page)
    return <PaginationCard {...args} page={page} onPageChange={setPage} />
  },
}

export const MiddlePage: Story = {
  args: {
    page: 6,
    totalPages: 12,
    total: 284,
    label: 'לקוחות',
    onPageChange: () => undefined,
  },
  render: (args) => {
    const [page, setPage] = useState(args.page)
    return <PaginationCard {...args} page={page} onPageChange={setPage} />
  },
}

export const LastPage: Story = {
  args: {
    page: 12,
    totalPages: 12,
    total: 284,
    label: 'לקוחות',
    onPageChange: () => undefined,
  },
  render: (args) => {
    const [page, setPage] = useState(args.page)
    return <PaginationCard {...args} page={page} onPageChange={setPage} />
  },
}
