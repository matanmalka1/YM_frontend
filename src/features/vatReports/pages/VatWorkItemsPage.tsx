import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import {
  useVatWorkItemsPage,
  VatWorkItemsCreateModal,
  VatWorkItemsFiltersCard,
  VatWorkItemsGroupedCards,
  VatWorkItemsStatsSection,
} from '@/features/vatReports'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'

export const VatWorkItems: React.FC = () => {
  const { headerProps, stats, filters, table, modals, permissions } = useVatWorkItemsPage()

  return (
    <PageContent>
      <PageHeader
        {...headerProps}
        actions={
          permissions.isAdvisor ? (
            <Button variant="ghost" size="sm" onClick={modals.openCreate}>
              דוח מע״מ חדש
              <Plus className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      {!permissions.isAdvisor && (
        <Alert variant="info" message='צפייה בלבד. פתיחת תיקי מע"מ זמינה ליועץ. ניתן לבצע הקלדת נתונים בתוך כל תיק.' />
      )}

      {stats.visible && <VatWorkItemsStatsSection stats={stats} />}

      <VatWorkItemsFiltersCard
        filters={filters.values}
        onFilterChange={filters.onFilterChange}
        onMultiFilterChange={filters.onMultiFilterChange}
        onClear={filters.resetFilters}
      />

      <VatWorkItemsGroupedCards
        groups={table.groups}
        columns={table.columns}
        isLoading={table.isLoading}
        error={table.error}
        onRowClick={table.onRowClick}
        filters={table.groupFilters}
        emptyState={table.emptyState}
      />

      <VatWorkItemsCreateModal {...modals.createProps} />

      <ConfirmDialog {...modals.deleteConfirmProps} />
    </PageContent>
  )
}
