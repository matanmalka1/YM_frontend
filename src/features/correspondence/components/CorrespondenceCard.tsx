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
import { CORRESPONDENCE_MESSAGES } from '../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

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
        title={CORRESPONDENCE_MESSAGES.card.title}
        subtitle={total > 0 ? CORRESPONDENCE_MESSAGES.card.recordsCount(total) : undefined}
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            {CORRESPONDENCE_MESSAGES.card.addRecordButton}
          </Button>
        }
      >
        {error && <Alert variant="error" message={error} />}

        {isLoading && <p className="py-4 text-center text-sm text-gray-500">{GLOBAL_UI_MESSAGES.common.loading}</p>}

        {!isLoading && entries.length === 0 && (
          <StateCard
            icon={MessageSquare}
            message={CORRESPONDENCE_MESSAGES.card.emptyMessage}
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
        title={CORRESPONDENCE_MESSAGES.card.deleteModalTitle}
        message={CORRESPONDENCE_MESSAGES.card.deleteMessage}
        confirmLabel={CORRESPONDENCE_MESSAGES.card.deleteConfirm}
        cancelLabel={GLOBAL_UI_MESSAGES.actions.cancel}
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
