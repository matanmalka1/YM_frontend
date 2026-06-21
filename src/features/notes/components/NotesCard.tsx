import { useState } from 'react'
import { Pencil, Trash2, X, Check, StickyNote } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Alert } from '@/components/ui/overlays/Alert'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { InlineState } from '@/components/ui/feedback'
import { cn, formatDateTime } from '@/utils/utils'
import type { EntityNote } from '../api'
import { useEntityNotes, type NotesTarget } from '../hooks/useEntityNotes'

const NOTE_TAGS = [
  { key: 'תזכורת', label: 'תזכורת', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { key: 'פגישה', label: 'פגישה', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { key: 'טיפול', label: 'טיפול', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { key: 'תיעוד', label: 'תיעוד', color: 'text-gray-600 bg-gray-100 border-gray-200' },
] as const

type NoteTagKey = (typeof NOTE_TAGS)[number]['key']

const TAG_COLOR = Object.fromEntries(NOTE_TAGS.map((t) => [t.key, t.color])) as Record<NoteTagKey, string>

const TAG_PREFIX_RE = /^\[([^\]]+)\]\s*/

const parseNote = (raw: string): { tag: NoteTagKey | null; body: string } => {
  const m = raw.match(TAG_PREFIX_RE)
  if (m && m[1] in TAG_COLOR) return { tag: m[1] as NoteTagKey, body: raw.slice(m[0].length) }
  return { tag: null, body: raw }
}

const getInitials = (name: string | null): string => {
  if (!name?.trim()) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2)
  return `${parts[0][0]}${parts[parts.length - 1][0]}`
}

interface NoteComposerProps {
  value: string
  onChange: (val: string) => void
  onSave: (text: string) => void
  onCancel: () => void
  isLoading: boolean
  initialTag?: NoteTagKey | null
}

const NoteComposer = ({ value, onChange, onSave, onCancel, isLoading, initialTag }: NoteComposerProps) => {
  const [selectedTag, setSelectedTag] = useState<NoteTagKey | null>(initialTag ?? null)

  const toggleTag = (key: NoteTagKey) => setSelectedTag((t) => (t === key ? null : key))

  const handleSave = () => {
    const text = value.trim()
    if (!text) return
    onSave(selectedTag ? `[${selectedTag}] ${text}` : text)
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
      <Textarea
        rows={3}
        placeholder="הזן הערה..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        autoFocus
        className="border-0 shadow-none focus:ring-0 resize-none"
      />
      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            <X className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isLoading}
            disabled={!value.trim()}
          >
            <Check className="h-3.5 w-3.5" />
            שמור
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {NOTE_TAGS.map((tag) => (
            <button
              key={tag.key}
              type="button"
              onClick={() => toggleTag(tag.key)}
              className={cn(
                'rounded border px-2 py-0.5 text-xs font-medium transition-colors',
                selectedTag === tag.key
                  ? tag.color
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50',
              )}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface NoteRowProps {
  note: EntityNote
  isDeleting: boolean
  onEdit: (note: EntityNote) => void
  onDelete: (id: number) => void
}

const NoteRow = ({ note, isDeleting, onEdit, onDelete }: NoteRowProps) => {
  const { tag, body } = parseNote(note.note)
  const author = note.created_by_name
  const initials = getInitials(author)
  return (
    <li className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {initials && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {author && <span className="text-sm font-semibold text-gray-900">{author}</span>}
          <span className="text-xs text-gray-400">{formatDateTime(note.created_at)}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 whitespace-pre-wrap break-words">{body}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        {tag && (
          <span className={cn('rounded border px-1.5 py-0.5 text-[11px] font-semibold', TAG_COLOR[tag])}>{tag}</span>
        )}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onEdit(note)}
            className="h-8 w-8 px-0 text-gray-500"
            title="ערוך"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note.id)}
            disabled={isDeleting}
            className="h-8 w-8 px-0 text-gray-500 hover:text-negative-600"
            title="מחק"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  )
}

type NotesCardProps = NotesTarget & { canEdit: boolean }

export const NotesCard = ({ canEdit, ...target }: NotesCardProps) => {
  const { notes, total, isLoading, error, addNote, isAdding, updateNote, isUpdating, deleteNote, deletingId } =
    useEntityNotes(target)

  const [addText, setAddText] = useState('')
  const [editing, setEditing] = useState<EntityNote | null>(null)
  const [editText, setEditText] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const handleEditStart = (note: EntityNote) => {
    setEditing(note)
    setEditText(parseNote(note.note).body)
  }

  const handleEditSave = async (text: string) => {
    if (!editing) return
    await updateNote(editing.id, text)
    setEditing(null)
    setEditText('')
  }

  const handleEditCancel = () => {
    setEditing(null)
    setEditText('')
  }

  return (
    <>
      <Card title="הערות" subtitle={total > 0 ? `${total} הערות` : undefined} className="shadow-sm">
        {error && <Alert variant="error" message={error} />}

        {canEdit && (
          <div className="mb-5">
            <NoteComposer
              value={addText}
              onChange={setAddText}
              onSave={async (text) => {
                await addNote(text)
                setAddText('')
              }}
              onCancel={() => setAddText('')}
              isLoading={isAdding}
            />
          </div>
        )}

        {isLoading && <p className="py-4 text-center text-sm text-gray-500">טוען...</p>}

        {!isLoading && notes.length === 0 && <InlineState icon={StickyNote} title="אין הערות עדיין" />}

        {!isLoading && notes.length > 0 && (
          <ul className="space-y-3">
            {notes.map((note) =>
              editing?.id === note.id ? (
                <li key={note.id}>
                  <NoteComposer
                    value={editText}
                    onChange={setEditText}
                    onSave={handleEditSave}
                    onCancel={handleEditCancel}
                    isLoading={isUpdating}
                    initialTag={parseNote(note.note).tag}
                  />
                </li>
              ) : (
                <NoteRow
                  key={note.id}
                  note={note}
                  isDeleting={deletingId === note.id}
                  onEdit={handleEditStart}
                  onDelete={(id) => setConfirmDeleteId(id)}
                />
              ),
            )}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="מחיקת הערה"
        message="האם למחוק את ההערה? פעולה זו אינה הפיכה."
        confirmLabel="מחק"
        cancelLabel="ביטול"
        confirmVariant="danger"
        isLoading={deletingId === confirmDeleteId}
        onConfirm={() => {
          if (confirmDeleteId !== null) deleteNote(confirmDeleteId)
          setConfirmDeleteId(null)
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  )
}
