import React from 'react'
import { cn } from '../../../utils/utils'
import { SectionHeader } from '../layout/SectionHeader'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'soft'
  interactive?: boolean
  size?: 'default' | 'compact'
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  disablePadding?: boolean
  bodyClassName?: string
  style?: React.CSSProperties
}

const variants = {
  default: 'bg-white shadow-elevation-1',
  elevated: 'bg-white shadow-elevation-2',
  outlined: 'bg-white border border-gray-200/70',
  soft: 'border border-slate-100 bg-white shadow-elevation-1',
}

const radii = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  icon,
  actions,
  footer,
  variant = 'default',
  interactive = false,
  size = 'default',
  radius = '3xl',
  disablePadding = false,
  bodyClassName,
  style,
  ...rest
}) => {
  const headerPadding = size === 'compact' ? 'px-5 py-3' : 'px-7 py-5'
  const bodyPadding = size === 'compact' ? 'p-5' : 'p-7'
  const footerPadding = size === 'compact' ? 'px-5 py-3' : 'px-7 py-5'

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        variants[variant],
        interactive && 'hover:shadow-elevation-3 hover:-translate-y-0.5 cursor-pointer',
        'animate-fade-in',
        className,
        radii[radius],
      )}
      style={style}
      {...rest}
    >
      {(title || subtitle || actions || icon) && (
        <div className={cn(headerPadding, children != null && 'border-b border-gray-100')}>
          <SectionHeader title={title} subtitle={subtitle} actions={actions} icon={icon} size="sm" />
        </div>
      )}

      {children != null && <div className={cn(!disablePadding && bodyPadding, bodyClassName)}>{children}</div>}

      {footer && <div className={cn(footerPadding, 'border-t border-gray-100 bg-gray-50/60')}>{footer}</div>}
    </div>
  )
}
