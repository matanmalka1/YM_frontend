import type { ReactNode } from 'react'
import { cn } from '@/utils/utils'

interface PageContentProps {
  children: ReactNode
  className?: string
}

export const PageContent = ({ children, className }: PageContentProps) => (
  <div className={cn('space-y-6', className)}>{children}</div>
)
PageContent.displayName = 'PageContent'
