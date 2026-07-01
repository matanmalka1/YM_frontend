import type { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <main dir="rtl" className="min-w-0 flex-1 overflow-y-auto px-6 pb-6 pt-3 md:px-8 md:pb-8 md:pt-4">
      {children}
    </main>
  )
}
