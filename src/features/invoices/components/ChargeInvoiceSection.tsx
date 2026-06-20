import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExternalLink, FilePlus2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { DrawerField, DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { Input } from '@/components/ui/inputs'
import { formatDateTime } from '@/utils/utils'
import {
  getInvoiceAttachDefaultValues,
  invoiceAttachSchema,
  toInvoiceAttachPayload,
  type InvoiceAttachFormValues,
} from '../schemas'
import { useChargeInvoice } from '../hooks/useChargeInvoice'

interface ChargeInvoiceSectionProps {
  chargeId: number
  chargeStatus: string
  canAttach: boolean
}

export const ChargeInvoiceSection: React.FC<ChargeInvoiceSectionProps> = ({ chargeId, chargeStatus, canAttach }) => {
  const [showForm, setShowForm] = useState(false)
  const { attachInvoice, invoice, invoiceError, isAttaching, isLoadingInvoice } = useChargeInvoice(chargeId)
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<InvoiceAttachFormValues>({
    defaultValues: getInvoiceAttachDefaultValues(),
    resolver: zodResolver(invoiceAttachSchema),
  })
  const canShowAttachForm = canAttach && chargeStatus === 'issued' && !invoice

  const submitForm = handleSubmit(async (values) => {
    const attached = await attachInvoice(toInvoiceAttachPayload(chargeId, values))
    if (attached) {
      reset(getInvoiceAttachDefaultValues())
      setShowForm(false)
    }
  })

  return (
    <DrawerSection title="חשבונית">
      {isLoadingInvoice && <DrawerField label="סטטוס" value="טוען פרטי חשבונית..." />}
      {invoiceError && <Alert variant="warning" message={invoiceError} />}

      {!isLoadingInvoice && invoice && (
        <>
          <DrawerField label="ספק" value={invoice.provider} />
          <DrawerField label="מזהה חיצוני" value={invoice.external_invoice_id} />
          <DrawerField label="הונפקה" value={formatDateTime(invoice.issued_at)} />
          <DrawerField label="צורפה" value={formatDateTime(invoice.created_at)} />
          {invoice.document_url && (
            <DrawerField
              label="מסמך"
              value={
                <a
                  href={invoice.document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                  onClick={(event) => event.stopPropagation()}
                >
                  פתח מסמך
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              }
            />
          )}
        </>
      )}

      {!isLoadingInvoice && !invoice && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {chargeStatus === 'issued' ? 'לא צורפה חשבונית לחיוב זה.' : 'ניתן לצרף חשבונית רק לחיוב שהונפק.'}
          </p>

          {canShowAttachForm && !showForm && (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <FilePlus2 className="h-3.5 w-3.5" />
              צרף חשבונית
            </Button>
          )}

          {canShowAttachForm && showForm && (
            <form onSubmit={submitForm} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="ספק *" error={errors.provider?.message} {...register('provider')} />
              <Input
                label="מזהה חשבונית *"
                error={errors.external_invoice_id?.message}
                {...register('external_invoice_id')}
              />
              <Input
                label="תאריך הנפקה *"
                type="datetime-local"
                error={errors.issued_at?.message}
                {...register('issued_at')}
              />
              <Input
                label="קישור למסמך"
                type="url"
                error={errors.document_url?.message}
                {...register('document_url')}
              />
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <Button type="submit" size="sm" isLoading={isAttaching}>
                  שמור חשבונית
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={isAttaching}
                >
                  ביטול
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </DrawerSection>
  )
}

ChargeInvoiceSection.displayName = 'ChargeInvoiceSection'
