import type { Meta, StoryObj } from '@storybook/react'
import { ModalFormActions } from './ModalFormActions'

const meta = {
  component: ModalFormActions,
  tags: ['autodocs'],
} satisfies Meta<typeof ModalFormActions>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    submitLabel: 'שמור',
    onCancel: () => undefined,
    onSubmit: () => undefined,
  },
}

export const Loading: Story = {
  args: {
    submitLabel: 'שומר',
    isLoading: true,
    onCancel: () => undefined,
    onSubmit: () => undefined,
  },
}

export const SubmitLoading: Story = {
  args: {
    submitLabel: 'שמור',
    submitLoading: true,
    onCancel: () => undefined,
    onSubmit: () => undefined,
  },
}

export const SubmitDisabled: Story = {
  args: {
    submitLabel: 'שמור',
    submitDisabled: true,
    onCancel: () => undefined,
    onSubmit: () => undefined,
  },
}

export const CancelDisabled: Story = {
  args: {
    submitLabel: 'שמור',
    cancelDisabled: true,
    onCancel: () => undefined,
    onSubmit: () => undefined,
  },
}

export const DangerSubmit: Story = {
  args: {
    submitLabel: 'מחק',
    submitVariant: 'danger',
    cancelLabel: 'ביטול',
    onCancel: () => undefined,
    onSubmit: () => undefined,
  },
}

export const SubmitType: Story = {
  args: {
    submitLabel: 'שלח',
    submitType: 'submit',
    submitForm: 'example-form',
    onCancel: () => undefined,
  },
}
