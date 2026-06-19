import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Textarea } from '@/components/ui/inputs/Textarea'
import type { VatSendBackFormProps } from '../../types'

export const VatSendBackForm: React.FC<VatSendBackFormProps> = ({ onCancel, onSubmit, loading }) => {
  const [note, setNote] = useState('')
  return (
    <div className="space-y-2 pb-2">
      <Textarea
        rows={3}
        placeholder="הסבר מה יש לתקן..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        dir="rtl"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          ביטול
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          isLoading={loading}
          disabled={!note.trim()}
          onClick={() => onSubmit(note)}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          החזר לתיקון
        </Button>
      </div>
    </div>
  )
}

VatSendBackForm.displayName = 'VatSendBackForm'
