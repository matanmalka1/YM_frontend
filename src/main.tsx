import './index.css'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppRoutes } from './router/AppRoutes'
import { queryClient } from './lib/queryClient'
import { AppErrorBoundary } from './components/errors/AppErrorBoundary'
import { PageLoader } from './components/ui/layout/PageLoader'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Could not find root element to mount to')
}

const root = ReactDOM.createRoot(rootElement)
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
              <AppRoutes />
              <Toaster richColors position="top-center" />
            </div>
          </Suspense>
        </AppErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
