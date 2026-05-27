import type { Meta, StoryObj } from '@storybook/react'
import { SkeletonBlock } from './SkeletonBlock'

const meta = {
  component: SkeletonBlock,
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonBlock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}

export const Wide: Story = {
  args: {
    width: 'w-64',
  },
}

export const Tall: Story = {
  args: {
    height: 'h-12',
  },
}

export const RoundedSmall: Story = {
  args: {
    rounded: 'sm',
  },
}

export const RoundedFull: Story = {
  args: {
    width: 'w-10',
    height: 'h-10',
    rounded: 'full',
  },
}

export const RoundedExtraLarge: Story = {
  args: {
    width: 'w-72',
    height: 'h-24',
    rounded: 'xl',
  },
}

export const Shimmer: Story = {
  args: {
    width: 'w-64',
    shimmer: true,
  },
}

export const Delayed: Story = {
  args: {
    delay: '0.2s',
  },
}
