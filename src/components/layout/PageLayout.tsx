import type { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <main dir="rtl" className="min-w-0 flex-1 overflow-y-auto p-6 md:p-8">
      {children}
    </main>
  )
}
