import { type ReactNode } from 'react'
import { Card } from '../../../../components/ui/primitives/Card'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'

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
  <Card title={title} size="compact" className="shadow-sm" actions={headerAction}>
    <DefinitionList
      columns={columns}
      items={items.map((item) => ({ ...item, value: displayValue(item.value) }))}
      className="gap-x-4 gap-y-2"
    />
  </Card>
)
