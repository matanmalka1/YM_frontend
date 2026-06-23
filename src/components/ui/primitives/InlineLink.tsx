import { cn } from '@/utils/utils'

interface InlineLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: React.ReactNode
  iconPosition?: 'start' | 'end'
}

export const InlineLink: React.FC<InlineLinkProps> = ({
  children,
  className,
  icon,
  iconPosition = 'end',
  ...props
}) => (
  <a className={cn('focus-ring inline-flex items-center gap-1 text-primary-600 hover:underline', className)} {...props}>
    {icon && iconPosition === 'start' && icon}
    {children}
    {icon && iconPosition === 'end' && icon}
  </a>
)
