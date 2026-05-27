import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from '../ui/primitives/Card'
import { PageHeader } from './PageHeader'
import { PageLayout } from './PageLayout'

const meta = {
  component: PageLayout,
  tags: ['autodocs'],
} satisfies Meta<typeof PageLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-6">
        <PageHeader title="לקוחות" description="תוכן הדף יושב בתוך אזור גלילה מרכזי." />
        <Card>
          <p className="text-sm text-gray-600">תוכן לדוגמה בתוך layout.</p>
        </Card>
      </div>
    ),
  },
}
