import type { Meta, StoryObj } from '@storybook/react-vite'
import { Timeline, TimelineEntry } from './Timeline'

const meta = {
  component: Timeline,
  tags: ['autodocs'],
} satisfies Meta<typeof Timeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <>
        <TimelineEntry>
          <p className="text-sm font-medium text-gray-900">הלקוח עודכן</p>
          <p className="mt-1 text-xs text-gray-500">סטטוס הלקוח שונה לפעיל.</p>
        </TimelineEntry>
        <TimelineEntry>
          <p className="text-sm font-medium text-gray-900">מסמך התקבל</p>
          <p className="mt-1 text-xs text-gray-500">אישור ניכוי מס במקור נוסף לתיק.</p>
        </TimelineEntry>
      </>
    ),
  },
}

export const SingleEntry: Story = {
  args: {
    children: (
      <TimelineEntry>
        <p className="text-sm font-medium text-gray-900">נוצר תיק לקוח</p>
        <p className="mt-1 text-xs text-gray-500">התיק נפתח על ידי יועץ.</p>
      </TimelineEntry>
    ),
  },
}

export const WithAnimationDelay: Story = {
  args: {
    children: (
      <>
        <TimelineEntry animationDelay="0s">
          <p className="text-sm font-medium text-gray-900">בקשה נשלחה</p>
        </TimelineEntry>
        <TimelineEntry animationDelay="0.1s">
          <p className="text-sm font-medium text-gray-900">תגובה התקבלה</p>
        </TimelineEntry>
        <TimelineEntry animationDelay="0.2s">
          <p className="text-sm font-medium text-gray-900">הטיפול הושלם</p>
        </TimelineEntry>
      </>
    ),
  },
}
