import { CheckSquare } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Button } from '@/components/ui/primitives/Button'
import { PaginationCard } from '@/components/ui/table/PaginationCard'
import { TaskModal } from '@/features/tasks/components/TaskModal'
import { useWorkQueuePage } from '../hooks/useWorkQueuePage'
import { useWorkQueueActions } from '../hooks/useWorkQueueActions'
import { WorkQueueSummaryCards } from '../components/WorkQueueSummaryCards'
import { WorkQueueFiltersBar } from '../components/WorkQueueFiltersBar'
import { WorkQueueTable } from '../components/WorkQueueTable'
import { groupWorkQueueItems } from '../utils/workQueueGrouping'

export const WorkQueuePage: React.FC = () => {
  const {
    items,
    summary,
    isSummaryLoading,
    summaryError,
    isLoading,
    error,
    search,
    setSearch,
    urgencyFilter,
    setUrgencyFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    linkedFilter,
    setLinkedFilter,
    scopeFilter,
    setScopeFilter,
    historyMode,
    setHistoryMode,
    hasContentFilters,
    hasFilters,
    clearFilters,
    page,
    total,
    totalPages,
    setPage,
  } = useWorkQueuePage()

  const {
    pendingConfirm,
    activeActionKey,
    taskModal,
    taskDetail,
    actionMutation,
    createTaskMutation,
    updateTaskMutation,
    openCreateTask,
    runAction,
    confirmAction,
    closeConfirm,
    closeTaskModal,
    submitTask,
  } = useWorkQueueActions()

  const header = (
    <PageHeader
      title="עבודה לטיפול"
      description="כל מה שדורש טיפול: דוחות, חיובים, מקדמות, קלסרים ומשימות ידניות."
      actions={
        <Button size="sm" onClick={openCreateTask}>
          משימה חדשה
        </Button>
      }
    />
  )

  const renderBody = () => {
    if (items.length === 0) {
      if (hasContentFilters) {
        return <StateCard icon={CheckSquare} title="אין תוצאות" message="אין תוצאות שתואמות לסינון" />
      }
      return (
        <StateCard
          icon={CheckSquare}
          variant="illustration"
          title={historyMode ? 'אין היסטוריה' : 'אין עבודה לטיפול'}
          message={
            historyMode
              ? 'אין משימות היסטוריות להצגה.'
              : 'אין כרגע עבודה לטיפול. כל הדוחות, התשלומים והמשימות הפעילות מסודרים.'
          }
        />
      )
    }

    return (
      <div className="space-y-5">
        {groupWorkQueueItems(items).map((group) => (
          <section key={group.key} className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h2 className="text-sm font-semibold text-gray-900">{group.label}</h2>
              <span className="text-xs text-gray-500">{group.rows.length} פריטים</span>
            </div>
            <WorkQueueTable items={group.rows} activeActionKey={activeActionKey} onAction={runAction} />
          </section>
        ))}
      </div>
    )
  }

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage="טוען משימות...">
      <WorkQueueSummaryCards
        summary={summary}
        isLoading={isSummaryLoading}
        summaryError={summaryError}
        urgencyFilter={urgencyFilter}
        onFilter={setUrgencyFilter}
        scopeFilter={scopeFilter}
        linkedFilter={linkedFilter}
        onScopeFilter={setScopeFilter}
        onLinkedFilter={setLinkedFilter}
      />

      <WorkQueueFiltersBar
        search={search}
        onSearchChange={setSearch}
        urgencyFilter={urgencyFilter}
        onUrgencyChange={setUrgencyFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        linkedFilter={linkedFilter}
        onLinkedChange={setLinkedFilter}
        scopeFilter={scopeFilter}
        onScopeChange={setScopeFilter}
        historyMode={historyMode}
        onHistoryModeChange={setHistoryMode}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {renderBody()}

      {!isLoading && total > 0 && (
        <PaginationCard page={page} totalPages={totalPages} total={total} label="משימות" onPageChange={setPage} />
      )}

      <ConfirmDialog
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.action.confirm_title ?? 'אישור פעולה'}
        message={pendingConfirm?.action.confirm_message ?? 'האם לבצע את הפעולה?'}
        confirmLabel="אישור"
        cancelLabel="ביטול"
        isLoading={actionMutation.isPending}
        onConfirm={confirmAction}
        onCancel={closeConfirm}
      />

      {taskModal && (
        <TaskModal
          mode={taskModal.mode}
          task={taskDetail.data}
          source={taskModal.source}
          isLoading={createTaskMutation.isPending || updateTaskMutation.isPending || taskDetail.isLoading}
          onClose={closeTaskModal}
          onSubmit={submitTask}
        />
      )}
    </PageStateGuard>
  )
}
