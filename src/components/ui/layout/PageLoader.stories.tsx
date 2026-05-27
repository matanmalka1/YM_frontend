import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageLoader } from './PageLoader'

const meta = {
  component: PageLoader,
  tags: ['autodocs'],
} satisfies Meta<typeof PageLoader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
