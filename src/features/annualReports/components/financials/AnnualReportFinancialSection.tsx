import type { ReactNode } from 'react'
import { cn, formatCurrencyILS as fmt } from '@/utils/utils'

interface AnnualReportFinancialSectionProps {
  icon: ReactNode
  title: string
  total: number
  titleClassName: string
  headerClassName: string
  totalClassName: string
  emptyMessage: string
  isEmpty: boolean
  children: ReactNode
  footer: ReactNode
}

export const AnnualReportFinancialSection: React.FC<AnnualReportFinancialSectionProps> = ({
  icon,
  title,
  total,
  titleClassName,
  headerClassName,
  totalClassName,
  emptyMessage,
  isEmpty,
  children,
  footer,
}) => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className={cn('flex items-center gap-2 border-b border-gray-100 px-5 py-3', headerClassName)}>
      {icon}
      <h4 className={cn('text-sm font-semibold', titleClassName)}>{title}</h4>
      <span className={cn('mr-auto text-xs font-medium', totalClassName)}>{fmt(total)}</span>
    </div>
    <div className="divide-y divide-gray-50 px-1">
      {isEmpty ? <p className="px-4 py-6 text-center text-sm text-gray-400">{emptyMessage}</p> : null}
      {children}
    </div>
    <div className="px-4 pb-3 pt-2">{footer}</div>
  </div>
)
