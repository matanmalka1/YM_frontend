import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageContent } from '@/components/layout/PageContent'
import {
  useVatWorkItemsPage,
  VatWorkItemsCreateModal,
  VatWorkItemsGroupedCards,
  VatWorkItemsStatsSection,
} from '@/features/vatReports'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
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
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              iconPosition="end"
              onClick={modals.openCreate}
            >
              דוח מע״מ חדש
            </Button>
          ) : undefined
        }
      />

      {!permissions.isAdvisor && (
        <Alert variant="info" message='צפייה בלבד. פתיחת תיקי מע"מ זמינה ליועץ. ניתן לבצע הקלדת נתונים בתוך כל תיק.' />
      )}

      {stats.visible && <VatWorkItemsStatsSection stats={stats} />}

      <FilterPanel {...filters} title="סינון דוחות מע״מ" subtitle="לקוח, שנה, סטטוס וסוג דיווח" />

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
