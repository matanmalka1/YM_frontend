import { CheckSquare } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { useWorkQueuePage } from '../hooks/useWorkQueuePage'
import { WorkQueueSummaryCards } from '../components/WorkQueueSummaryCards'
import { WorkQueueFiltersBar } from '../components/WorkQueueFiltersBar'
import { WorkQueueTable } from '../components/WorkQueueTable'

export const WorkQueuePage: React.FC = () => {
  const {
    items,
    allItems,
    isLoading,
    error,
    urgencyFilter,
    setUrgencyFilter,
    typeFilter,
    setTypeFilter,
    hasFilters,
    clearFilters,
  } = useWorkQueuePage()

  const header = <PageHeader title="משימות" description="כלל המשימות הפעילות: מועדי מס, מקדמות, דוחות וחיובים פתוחים" />

  const renderBody = () => {
    if (items.length === 0) {
      if (hasFilters) {
        return (
          <StateCard
            icon={CheckSquare}
            title="לא נמצאו משימות"
            message="לא נמצאו משימות התואמות את הסינון"
            secondaryAction={{ label: 'אפס סינון', onClick: clearFilters }}
          />
        )
      }
      return (
        <StateCard
          icon={CheckSquare}
          variant="illustration"
          title="אין משימות פעילות"
          message="כל המשימות הושלמו או שאין מועדים קרובים."
        />
      )
    }

    return <WorkQueueTable items={items} />
  }

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage="טוען משימות...">
      <WorkQueueSummaryCards items={allItems} urgencyFilter={urgencyFilter} onFilter={setUrgencyFilter} />

      <WorkQueueFiltersBar
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {renderBody()}
    </PageStateGuard>
  )
}
