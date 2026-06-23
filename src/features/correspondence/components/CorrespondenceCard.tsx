import { useState } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import { Card } from '../../../components/ui/primitives/Card'
import { Button } from '../../../components/ui/primitives/Button'
import { Alert } from '../../../components/ui/overlays/Alert'
import { StateCard } from '../../../components/ui/feedback/StateCard'
import { ConfirmDialog } from '../../../components/ui/overlays/ConfirmDialog'
import { CorrespondenceEntryItem } from './CorrespondenceEntry'
import { CorrespondenceModal } from './CorrespondenceModal'
import { useCorrespondence } from '../hooks/useCorrespondence'
import type { CorrespondenceEntry } from '../api'
import type { CorrespondenceFormValues } from '../schemas'

interface CorrespondenceCardProps {
  businessId: number | undefined
  clientId?: number
}

export const CorrespondenceCard = ({ businessId, clientId }: CorrespondenceCardProps) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CorrespondenceEntry | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const {
    entries,
    total,
    isLoading,
    error,
    createEntry,
    isCreating,
    updateEntry,
    isUpdating,
    deleteEntry,
    deletingId,
    contacts,
  } = useCorrespondence(businessId, clientId, modalOpen)

  const handleSubmit = async (data: CorrespondenceFormValues) => {
    if (editing) {
      await updateEntry(editing.id, data)
    } else {
      await createEntry(data)
    }
    setModalOpen(false)
    setEditing(null)
  }

  const handleEdit = (entry: CorrespondenceEntry) => {
    setEditing(entry)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditing(null)
  }

  return (
    <>
      <Card
        title="יומן תקשורת עם רשויות"
        subtitle={total > 0 ? `${total} רשומות` : undefined}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            הוסף רשומה
          </Button>
        }
      >
        {error && <Alert variant="error" message={error} />}

        {isLoading && <p className="py-4 text-center text-sm text-gray-500">טוען...</p>}

        {!isLoading && entries.length === 0 && (
          <StateCard
            icon={MessageSquare}
            message="אין רשומות תקשורת עדיין — הוסף את הרשומה הראשונה"
            size="compact"
            variant="minimal"
          />
        )}

        {!isLoading && entries.length > 0 && (
          <div className="relative mt-2">
            <div className="absolute right-[18px] top-0 bottom-0 w-px bg-gray-200" />
            <ul className="space-y-1">
              {entries.map((entry) => (
                <CorrespondenceEntryItem
                  key={entry.id}
                  entry={entry}
                  isDeleting={deletingId === entry.id}
                  onEdit={handleEdit}
                  onDelete={(id) => setConfirmDeleteId(id)}
                />
              ))}
            </ul>
          </div>
        )}
      </Card>

      <CorrespondenceModal
        open={modalOpen}
        isCreating={isCreating || isUpdating}
        onClose={handleClose}
        onSubmit={handleSubmit}
        existing={editing}
        contacts={contacts}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="מחיקת רשומה"
        message="האם למחוק את הרשומה? פעולה זו אינה הפיכה."
        confirmLabel="מחק"
        cancelLabel="ביטול"
        confirmVariant="danger"
        isLoading={deletingId === confirmDeleteId}
        onConfirm={() => {
          if (confirmDeleteId !== null) {
            deleteEntry(confirmDeleteId)
            setConfirmDeleteId(null)
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </>
  )
}

CorrespondenceCard.displayName = 'CorrespondenceCard'
