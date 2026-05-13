import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { CheckSquare } from 'lucide-react'
import { api } from '@/api/client'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageStateGuard } from '@/components/ui/layout/PageStateGuard'
import { StateCard } from '@/components/ui/feedback/StateCard'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { tasksQK } from '@/features/tasks/api'
import { toast } from '@/utils/toast'
import { useWorkQueuePage } from '../hooks/useWorkQueuePage'
import { WorkQueueSummaryCards } from '../components/WorkQueueSummaryCards'
import { WorkQueueFiltersBar } from '../components/WorkQueueFiltersBar'
import { WorkQueueTable } from '../components/WorkQueueTable'
import { workQueueQK } from '../api'
import { workQueueSourceTypeLabels } from '../constants'
import type { WorkQueueAction, WorkQueueItem } from '../api'

const actionKey = (item: WorkQueueItem, action: WorkQueueAction) => `${item.id}:${action.key}`

const metadataText = (value: unknown): string | null => {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number') return String(value)
  return null
}

const metadataValue = (item: WorkQueueItem, key: string): unknown => {
  const metadata = item.metadata as Record<string, unknown> | null | undefined
  return metadata?.[key]
}

const groupLabel = (item: WorkQueueItem): string => {
  const type = item.type_label ?? workQueueSourceTypeLabels[item.source_type] ?? item.source_type
  const period = metadataText(metadataValue(item, 'period'))
  const taxYear = metadataText(metadataValue(item, 'tax_year'))
  const datePart = item.due_date ? `יעד ${item.due_date}` : 'ללא תאריך יעד'
  const context = period ?? taxYear
  return context ? `${type} · ${context} · ${datePart}` : `${type} · ${datePart}`
}

const groupItems = (items: WorkQueueItem[]) => {
  const groups = new Map<string, WorkQueueItem[]>()
  for (const item of items) {
    const label = groupLabel(item)
    groups.set(label, [...(groups.get(label) ?? []), item])
  }
  return Array.from(groups, ([label, rows]) => ({ label, rows }))
}

export const WorkQueuePage: React.FC = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [pendingConfirm, setPendingConfirm] = useState<{ item: WorkQueueItem; action: WorkQueueAction } | null>(null)
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null)
  const {
    items,
    allItems,
    isLoading,
    error,
    search,
    setSearch,
    urgencyFilter,
    setUrgencyFilter,
    typeFilter,
    setTypeFilter,
    linkedFilter,
    setLinkedFilter,
    specialFilter,
    setSpecialFilter,
    hasFilters,
    clearFilters,
  } = useWorkQueuePage()

  const header = <PageHeader title="משימות" description="כלל המשימות הפעילות: מועדי מס, מקדמות, דוחות וחיובים פתוחים" />

  const actionMutation = useMutation({
    mutationFn: async ({ action }: { item: WorkQueueItem; action: WorkQueueAction }) => {
      if (!action.endpoint || !action.method) throw new Error('פעולה לא תקינה')
      return api.request({ url: action.endpoint, method: action.method })
    },
    onSuccess: async (_data, variables) => {
      toast.success('הפעולה בוצעה בהצלחה')
      await qc.invalidateQueries({ queryKey: workQueueQK.all })
      if (variables.action.key.includes('task')) {
        await qc.invalidateQueries({ queryKey: tasksQK.all })
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'הפעולה נכשלה')
      void qc.invalidateQueries({ queryKey: workQueueQK.all })
    },
    onSettled: () => setActiveActionKey(null),
  })

  const runAction = (item: WorkQueueItem, action: WorkQueueAction) => {
    if (action.disabled) {
      if (action.disabled_reason) toast.warning(action.disabled_reason)
      return
    }
    if (action.type === 'link') {
      if (action.route) navigate(action.route)
      return
    }
    if (action.confirm) {
      setPendingConfirm({ item, action })
      return
    }
    setActiveActionKey(actionKey(item, action))
    actionMutation.mutate({ item, action })
  }

  const confirmAction = () => {
    if (!pendingConfirm) return
    const { item, action } = pendingConfirm
    setActiveActionKey(actionKey(item, action))
    actionMutation.mutate({ item, action })
    setPendingConfirm(null)
  }

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

    return (
      <div className="space-y-5">
        {groupItems(items).map((group) => (
          <section key={group.label} className="space-y-3">
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
        items={allItems}
        urgencyFilter={urgencyFilter}
        onFilter={setUrgencyFilter}
        specialFilter={specialFilter}
        onSpecialFilter={setSpecialFilter}
      />

      <WorkQueueFiltersBar
        search={search}
        onSearchChange={setSearch}
        urgencyFilter={urgencyFilter}
        onUrgencyChange={setUrgencyFilter}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        linkedFilter={linkedFilter}
        onLinkedChange={setLinkedFilter}
        hasFilters={hasFilters}
        onClear={clearFilters}
      />

      {renderBody()}

      <ConfirmDialog
        open={Boolean(pendingConfirm)}
        title={pendingConfirm?.action.confirm_title ?? 'אישור פעולה'}
        message={pendingConfirm?.action.confirm_message ?? 'האם לבצע את הפעולה?'}
        confirmLabel="אישור"
        cancelLabel="ביטול"
        isLoading={actionMutation.isPending}
        onConfirm={confirmAction}
        onCancel={() => setPendingConfirm(null)}
      />
    </PageStateGuard>
  )
}
