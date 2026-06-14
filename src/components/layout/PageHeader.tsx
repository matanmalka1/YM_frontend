import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { staggerDelay } from '../../utils/animation'
import { SectionHeader } from '../ui/layout/SectionHeader'

export interface Breadcrumb {
  label: string
  to?: string
}

export interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  size?: 'md' | 'lg'
}

export const PageHeader = ({ title, description, breadcrumbs, actions, size = 'lg' }: PageHeaderProps) => (
  <header className="space-y-4 animate-fade-in">
    {breadcrumbs?.length ? (
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm animate-slide-in">
        {breadcrumbs.map((crumb, index) => {
          const isCurrentPage = index === breadcrumbs.length - 1

          return (
            <div key={`${crumb.to ?? crumb.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <ChevronLeft className="h-4 w-4 text-gray-400" aria-hidden="true" />}

              {isCurrentPage || !crumb.to ? (
                <span className="font-medium text-gray-900" aria-current={isCurrentPage ? 'page' : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="font-medium text-gray-600 transition-colors duration-200 hover:text-primary-600"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          )
        })}
      </nav>
    ) : null}

    <SectionHeader
      title={title}
      subtitle={description}
      size={size}
      actions={
        actions ? (
          <div className="flex items-center gap-2 animate-slide-in" style={{ animationDelay: staggerDelay(1, 100) }}>
            {actions}
          </div>
        ) : undefined
      }
    />
  </header>
)
