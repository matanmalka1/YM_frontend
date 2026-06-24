import { useState } from 'react'
import { Pencil, Trash2, X, Check, StickyNote } from 'lucide-react'
import { Card } from '@/components/ui/primitives/Card'
import { Button } from '@/components/ui/primitives/Button'
import { Chip, ChipLabel } from '@/components/ui/primitives/Chip'
import { Alert } from '@/components/ui/overlays/Alert'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { Textarea } from '@/components/ui/inputs/Textarea'
import { InlineState } from '@/components/ui/feedback'
import { formatDateTime } from '@/utils/utils'
import type { EntityNote } from '../api'
import { useEntityNotes, type NotesTarget } from '../hooks/useEntityNotes'
import { NOTES_MESSAGES } from '../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

const NOTE_TAGS = [
  { key: NOTES_MESSAGES.tags.reminder, label: NOTES_MESSAGES.tags.reminder, tone: 'orange' },
  { key: NOTES_MESSAGES.tags.meeting, label: NOTES_MESSAGES.tags.meeting, tone: 'purple' },
  { key: NOTES_MESSAGES.tags.treatment, label: NOTES_MESSAGES.tags.treatment, tone: 'rose' },
  { key: NOTES_MESSAGES.tags.documentation, label: NOTES_MESSAGES.tags.documentation, tone: 'neutral' },
] as const

type NoteTagKey = (typeof NOTE_TAGS)[number]['key']

const TAGS_BY_KEY = new Set<NoteTagKey>(NOTE_TAGS.map((t) => t.key))
const TAG_TONES = Object.fromEntries(NOTE_TAGS.map((tag) => [tag.key, tag.tone])) as Record<
  NoteTagKey,
  (typeof NOTE_TAGS)[number]['tone']
>

const TAG_PREFIX_RE = /^\[([^\]]+)\]\s*/

const parseNote = (raw: string): { tag: NoteTagKey | null; body: string } => {
  const m = raw.match(TAG_PREFIX_RE)
  if (m && TAGS_BY_KEY.has(m[1] as NoteTagKey)) return { tag: m[1] as NoteTagKey, body: raw.slice(m[0].length) }
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
        placeholder={NOTES_MESSAGES.composer.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        autoFocus
        className="border-0 shadow-none focus:ring-0 resize-none"
      />
      <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<X className="h-3.5 w-3.5" />}
            onClick={onCancel}
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="primary"
            size="sm"
            icon={<Check className="h-3.5 w-3.5" />}
            onClick={handleSave}
            isLoading={isLoading}
            disabled={!value.trim()}
          >
            {NOTES_MESSAGES.composer.saveButton}
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {NOTE_TAGS.map((tag) => (
            <Chip
              key={tag.key}
              tone={tag.tone}
              size="xs"
              selected={selectedTag === tag.key}
              onClick={() => toggleTag(tag.key)}
            >
              {tag.label}
            </Chip>
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
          <ChipLabel tone={TAG_TONES[tag]} size="xs">
            {tag}
          </ChipLabel>
        )}
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => onEdit(note)}
            className="h-8 w-8 px-0 text-gray-500"
            title={NOTES_MESSAGES.row.editTitle}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={() => onDelete(note.id)}
            disabled={isDeleting}
            className="h-8 w-8 px-0 text-gray-500 hover:text-negative-600"
            title={NOTES_MESSAGES.row.deleteTitle}
          />
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
      <Card title={NOTES_MESSAGES.card.title} subtitle={total > 0 ? NOTES_MESSAGES.card.notesCount(total) : undefined}>
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

        {isLoading && <p className="py-4 text-center text-sm text-gray-500">{GLOBAL_UI_MESSAGES.common.loading}</p>}

        {!isLoading && notes.length === 0 && <InlineState icon={StickyNote} title={NOTES_MESSAGES.card.emptyTitle} />}

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
        title={NOTES_MESSAGES.card.deleteModalTitle}
        message={NOTES_MESSAGES.card.deleteMessage}
        confirmLabel={NOTES_MESSAGES.card.deleteConfirm}
        cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
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
