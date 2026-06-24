import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Textarea } from '@/components/ui/inputs/Textarea'
import type { VatSendBackFormProps } from '../../types'
import { VAT_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

export const VatSendBackForm: React.FC<VatSendBackFormProps> = ({ onCancel, onSubmit, loading }) => {
  const [note, setNote] = useState('')
  return (
    <div className="space-y-2 pb-2">
      <Textarea
        rows={3}
        placeholder={VAT_MESSAGES.form.sendBackPlaceholder}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {GLOBAL_UI_MESSAGES.actions.cancel}
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
          {VAT_MESSAGES.actions.sendBack}
        </Button>
      </div>
    </div>
  )
}

VatSendBackForm.displayName = 'VatSendBackForm'
