import { useEffect, useMemo } from 'react'
import { CheckSquare, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Button } from '@/components/ui/primitives/Button'
import { PaginatedDataTable } from '@/components/ui/table/PaginatedDataTable'
import { TaskModal } from '@/features/tasks'
import { useWorkQueuePage } from '../hooks/useWorkQueuePage'
import { useWorkQueueActions } from '../hooks/useWorkQueueActions'
import { WorkQueueSummaryCards } from '../components/WorkQueueSummaryCards'
import { WorkQueueFiltersBar } from '../components/WorkQueueFiltersBar'
import { buildWorkQueueColumns } from '../components/workQueueColumns'
import { WORK_QUEUE_FILTER_PARAM_KEYS, WORK_QUEUE_PAGE_SIZE } from '../constants'
import { toast } from '@/utils/toast'

export const WorkQueuePage: React.FC = () => {
  const {
    items,
    summary,
    isLoading,
    isFetching,
    error,
    search,
    urgencyFilter,
    typeFilter,
    statusFilter,
    linkedFilter,
    scopeFilter,
    historyMode,
    handleFilterChange,
    handleMultiFilterChange,
    hasContentFilters,
    hasFilters,
    clearFilters,
    page,
    total,
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
        <Button size="sm" variant="ghost" data-work-queue-focus-fallback="true" onClick={openCreateTask}>
          משימה חדשה
          <Plus className="h-3.5 w-3.5" />
        </Button>
      }
    />
  )

  useEffect(() => {
    if (error) toast.error('טעינת העבודה לטיפול נכשלה', { description: error })
  }, [error])

  const { showLinkedTasks, showWarnings } = useMemo(
    () => ({
      showLinkedTasks: items.some((item) => item.linked_tasks_count > 0),
      showWarnings: items.some((item) => item.warnings.length > 0),
    }),
    [items],
  )
  const columns = useMemo(
    () => buildWorkQueueColumns({ activeActionKey, onAction: runAction, showLinkedTasks, showWarnings }),
    [activeActionKey, runAction, showLinkedTasks, showWarnings],
  )

  const renderEmpty = () =>
    hasContentFilters ? (
      <StateCard icon={CheckSquare} title="אין תוצאות" message="אין תוצאות שתואמות לסינון" />
    ) : (
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

  return (
    <PageStateGuard isLoading={isLoading} error={error} header={header} loadingMessage="טוען משימות...">
      <WorkQueueSummaryCards
        summary={summary}
        isLoading={isFetching}
        summaryError={error}
        urgencyFilter={urgencyFilter}
        onFilter={(urgency) => handleFilterChange(WORK_QUEUE_FILTER_PARAM_KEYS.urgency, urgency ?? '')}
      />

      <WorkQueueFiltersBar
        search={search}
        urgencyFilter={urgencyFilter}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        linkedFilter={linkedFilter}
        scopeFilter={scopeFilter}
        historyMode={historyMode}
        hasFilters={hasFilters}
        onFilterChange={handleFilterChange}
        onMultiFilterChange={handleMultiFilterChange}
        onClear={clearFilters}
      />

      <PaginatedDataTable
        data={items}
        columns={columns}
        getRowKey={(item) => item.id}
        isLoading={isLoading}
        isFetching={isFetching}
        page={page}
        pageSize={WORK_QUEUE_PAGE_SIZE}
        total={total}
        label="משימות"
        onPageChange={setPage}
        renderEmpty={renderEmpty}
        showPagination={total > 0}
        stickyHeader
      />

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
