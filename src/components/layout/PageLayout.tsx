interface PageLayoutProps {
  children: React.ReactNode
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8">
      <div>{children}</div>
    </main>
  )
}
