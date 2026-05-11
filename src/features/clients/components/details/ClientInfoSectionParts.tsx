import { type ReactNode } from 'react'
import { Card } from '../../../../components/ui/primitives/Card'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'
import { cn } from '@/utils/utils'

const EMPTY_VALUE = '—'

type DefinitionItem = {
  label: string
  value: ReactNode
}

const EmptyValue = () => <span className="font-medium text-gray-400">{EMPTY_VALUE}</span>

const displayValue = (value: ReactNode) => {
  if (value === EMPTY_VALUE || value === '' || value == null) return <EmptyValue />
  return value
}

const SectionCard = ({ title, children, className }: { title: string; children: ReactNode; className?: string }) => (
  <Card title={title} size="compact" className={cn('shadow-sm', className)}>
    {children}
  </Card>
)

export const DefinitionSectionCard = ({
  title,
  items,
  columns,
  headerAction,
}: {
  title: string
  items: DefinitionItem[]
  columns: 2 | 3
  headerAction?: ReactNode
}) => (
  <SectionCard title={title}>
    {headerAction && <div className="mb-3">{headerAction}</div>}
    <DefinitionList
      columns={columns}
      items={items.map((item) => ({ ...item, value: displayValue(item.value) }))}
      className="gap-x-4 gap-y-2"
    />
  </SectionCard>
)
