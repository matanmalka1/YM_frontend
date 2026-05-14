import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { taskPriorityLabels, taskPriorityValues } from '../constants'
import type { Task, TaskCreateRequest, TaskPriority, TaskUpdateRequest } from '../api/contracts'

export interface TaskSourceContext {
  source_domain: string
  source_id: number
  title: string
  client_name?: string | null
  due_date?: string | null
  linked_tasks_count?: number
  linked_tasks?: Array<{ id: number; title: string; status: string }>
}

interface TaskModalProps {
  mode: 'create' | 'edit' | 'view'
  task?: Task | null
  source?: TaskSourceContext | null
  isLoading?: boolean
  onSubmit?: (data: TaskCreateRequest | TaskUpdateRequest) => void
  onClose: () => void
}

const priorityOptions = taskPriorityValues.map((value) => ({ value, label: taskPriorityLabels[value] }))

const roleOptions = [
  { value: '', label: 'לא מוגדר' },
  { value: 'advisor', label: 'יועץ' },
  { value: 'secretary', label: 'מזכירה' },
]

const toDateInput = (value?: string | null) => value?.slice(0, 10) ?? ''
const toApiDateTime = (value: string) => (value ? `${value}T00:00:00Z` : undefined)

export const TaskModal: React.FC<TaskModalProps> = ({ mode, task, source, isLoading, onSubmit, onClose }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [assignedRole, setAssignedRole] = useState('')

  const readonly = mode === 'view'
  const linkedCount = source?.linked_tasks_count ?? source?.linked_tasks?.length ?? 0
  const isTaskLoading = mode !== 'create' && !task

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setPriority(task?.priority ?? 'normal')
    setDueDate(toDateInput(task?.due_date ?? source?.due_date))
    setAssignedRole(task?.assigned_role ?? '')
  }, [task, source])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSubmit || readonly || !title.trim()) return
    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      due_date: toApiDateTime(dueDate),
      assigned_role: assignedRole || undefined,
    }
    onSubmit(
      mode === 'create' && source
        ? { ...base, source_domain: source.source_domain, source_id: source.source_id }
        : base,
    )
  }

  const modalTitle =
    mode === 'create' ? (source ? 'משימה חדשה מקושרת' : 'משימה חדשה') : mode === 'edit' ? 'עריכת משימה' : 'פרטי משימה'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{modalTitle}</h2>
          {source && (
            <div className="mt-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
              <div>מקור: {source.title}</div>
              {source.client_name && <div>לקוח: {source.client_name}</div>}
              {linkedCount > 0 && (
                <div className="mt-2 font-medium text-orange-800">כבר קיימות {linkedCount} משימות קשורות</div>
              )}
              {source.linked_tasks?.length ? (
                <ul className="mt-2 list-inside list-disc text-xs text-blue-800">
                  {source.linked_tasks.slice(0, 3).map((linked) => (
                    <li key={linked.id}>
                      {linked.title} · {linked.status}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        {isTaskLoading ? (
          <div className="space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
              טוען פרטי משימה...
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={onClose}>
                סגור
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="כותרת *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={readonly}
              required
            />
            <Textarea
              label="פרטים"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={readonly}
              rows={4}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Select
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                label="עדיפות"
                disabled={readonly}
              />
              <DatePicker label="תאריך יעד" value={dueDate} onChange={setDueDate} disabled={readonly} />
            </div>
            <Select
              options={roleOptions}
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value)}
              label="שיוך לתפקיד"
              disabled={readonly}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                סגור
              </Button>
              {!readonly && (
                <Button type="submit" disabled={!title.trim() || isLoading} isLoading={isLoading}>
                  {mode === 'edit' ? 'שמור' : 'צור משימה'}
                </Button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
