import { useState } from 'react'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { taskPriorityValues, taskPriorityLabels } from '../constants'
import type { TaskCreateRequest, TaskPriority } from '../api/contracts'

interface CreateTaskModalProps {
  onSubmit: (data: TaskCreateRequest) => void
  onClose: () => void
  isLoading?: boolean
}

const priorityOptions = [
  { value: '', label: 'רגילה' },
  ...taskPriorityValues.map((v) => ({ value: v, label: taskPriorityLabels[v] })),
]

const roleOptions = [
  { value: '', label: 'לא מוגדר' },
  { value: 'advisor', label: 'יועץ' },
  { value: 'secretary', label: 'מזכירה' },
]

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onSubmit, onClose, isLoading }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority | ''>('')
  const [dueDate, setDueDate] = useState('')
  const [assignedRole, setAssignedRole] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority || undefined,
      due_date: dueDate || undefined,
      assigned_role: assignedRole || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">משימה חדשה</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="כותרת *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="תיאור קצר של המשימה"
          />
          <Input
            label="פרטים"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="פרטים נוספים (אופציונלי)"
          />
          <Select
            options={priorityOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority | '')}
            label="עדיפות"
          />
          <Input
            label="תאריך יעד"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Select
            options={roleOptions}
            value={assignedRole}
            onChange={(e) => setAssignedRole(e.target.value)}
            label="שיוך לתפקיד"
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              ביטול
            </Button>
            <Button type="submit" disabled={!title.trim() || isLoading}>
              צור משימה
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
