import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExternalLink, FilePlus2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { InlineLink } from '@/components/ui/primitives/InlineLink'
import { DefinitionList } from '@/components/ui/layout/DefinitionList'
import { DrawerSection } from '@/components/ui/overlays/DrawerPrimitives'
import { Input } from '@/components/ui/inputs'
import { formatDateTime } from '@/utils/utils'
import {
  getInvoiceAttachDefaultValues,
  invoiceAttachSchema,
  toInvoiceAttachPayload,
  type InvoiceAttachFormValues,
} from '../schemas'
import { useChargeInvoice } from '../hooks/useChargeInvoice'
import { GLOBAL_UI_MESSAGES } from '@/messages'
import { INVOICES_MESSAGES } from '../messages'

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
    <DrawerSection title={INVOICES_MESSAGES.section.title}>
      {isLoadingInvoice && (
        <DefinitionList
          layout="stacked"
          items={[{ label: INVOICES_MESSAGES.section.status, value: INVOICES_MESSAGES.section.loadingDetails }]}
        />
      )}
      {invoiceError && <Alert variant="warning" message={invoiceError} />}

      {!isLoadingInvoice && invoice && (
        <DefinitionList
          layout="stacked"
          items={[
            { label: INVOICES_MESSAGES.section.provider, value: invoice.provider },
            { label: INVOICES_MESSAGES.section.externalId, value: invoice.external_invoice_id },
            { label: INVOICES_MESSAGES.section.issuedAt, value: formatDateTime(invoice.issued_at) },
            { label: INVOICES_MESSAGES.section.attachedAt, value: formatDateTime(invoice.created_at) },
            ...(invoice.document_url
              ? [
                  {
                    label: INVOICES_MESSAGES.section.document,
                    value: (
                      <InlineLink
                        href={invoice.document_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        icon={<ExternalLink className="h-3.5 w-3.5" />}
                      >
                        {INVOICES_MESSAGES.section.openDocument}
                      </InlineLink>
                    ),
                  },
                ]
              : []),
          ]}
        />
      )}

      {!isLoadingInvoice && !invoice && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {chargeStatus === 'issued'
              ? INVOICES_MESSAGES.section.noInvoice
              : INVOICES_MESSAGES.section.attachIssuedOnly}
          </p>

          {canShowAttachForm && !showForm && (
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(true)} className="gap-1.5">
              <FilePlus2 className="h-3.5 w-3.5" />
              {INVOICES_MESSAGES.section.attachInvoice}
            </Button>
          )}

          {canShowAttachForm && showForm && (
            <form onSubmit={submitForm} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label={INVOICES_MESSAGES.section.providerRequired}
                error={errors.provider?.message}
                {...register('provider')}
              />
              <Input
                label={INVOICES_MESSAGES.section.invoiceIdRequired}
                error={errors.external_invoice_id?.message}
                {...register('external_invoice_id')}
              />
              <Input
                label={INVOICES_MESSAGES.section.issuedAtRequired}
                type="datetime-local"
                error={errors.issued_at?.message}
                {...register('issued_at')}
              />
              <Input
                label={INVOICES_MESSAGES.section.documentUrl}
                type="url"
                error={errors.document_url?.message}
                {...register('document_url')}
              />
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                <Button type="submit" size="sm" isLoading={isAttaching}>
                  {INVOICES_MESSAGES.section.save}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  disabled={isAttaching}
                >
                  {GLOBAL_UI_MESSAGES.actions.cancel}
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
