import { GLOBAL_UI_MESSAGES } from '@/messages'
import { useEffect } from 'react'
import { ClientSearchInput, createClientIdPickerHandlers, useClientPickerState } from '@/features/clients/public'
import { Input, Select, Textarea } from '@/components/ui/inputs'
import { Modal, ModalFormActions } from '@/components/ui/overlays'
import { useCreateReport } from '../../hooks/useCreateReport'
import { SUBMISSION_METHOD_OPTIONS } from '../../constants/submissionMethodOptions'
import {
  CLIENT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
  EXTENSION_REASON_OPTIONS,
  TAX_YEAR_LIMITS,
} from '../../constants/sharedConstants'
import { FinancialFields, RequiredAppendices, TaxPreview } from './CreateReportModalParts'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

interface CreateReportModalProps {
  open: boolean
  onClose: () => void
  taxYear?: number
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({ open, onClose, taxYear }) => {
  const { form, onSubmit, isSubmitting, preview, resetForm } = useCreateReport(taxYear, onClose)
  const {
    register,
    setValue,
    formState: { errors },
  } = form
  const { clientQuery, selectedClient, handleSelectClient, handleClearClient, handleClientQueryChange, resetClientPicker } =
    useClientPickerState(createClientIdPickerHandlers((value, options) => setValue('client_id', value, options)))

  useEffect(() => {
    if (open) return
    resetForm()
    resetClientPicker()
  }, [open, resetClientPicker, resetForm])

  const handleClose = () => {
    resetForm()
    resetClientPicker()
    onClose()
  }

  return (
    <Modal
      open={open}
      title={ANNUAL_REPORTS_MESSAGES.createModal.title}
      onClose={handleClose}
      footer={
        <ModalFormActions
          onCancel={handleClose}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          submitLabel={ANNUAL_REPORTS_MESSAGES.createModal.submitLabel}
        />
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" {...register('client_id')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ClientSearchInput
              selectedClient={selectedClient}
              value={clientQuery}
              onChange={handleClientQueryChange}
              onSelect={handleSelectClient}
              onClear={handleClearClient}
              error={errors.client_id?.message}
              label={ANNUAL_REPORTS_MESSAGES.createModal.clientLabel}
            />
          </div>
          <Input
            label={ANNUAL_REPORTS_MESSAGES.createModal.taxYearLabel}
            type="number"
            min={TAX_YEAR_LIMITS.min}
            max={TAX_YEAR_LIMITS.max}
            error={errors.tax_year?.message}
            {...register('tax_year')}
          />
        </div>

        <Select
          label={ANNUAL_REPORTS_MESSAGES.createModal.clientTypeLabel}
          options={CLIENT_TYPE_OPTIONS}
          error={errors.client_type?.message}
          {...register('client_type')}
        />

        <Select
          label={ANNUAL_REPORTS_MESSAGES.createModal.deadlineTypeLabel}
          options={DEADLINE_TYPE_OPTIONS}
          error={errors.deadline_type?.message}
          {...register('deadline_type')}
        />

        <Select
          label={ANNUAL_REPORTS_MESSAGES.createModal.submissionMethodLabel}
          options={SUBMISSION_METHOD_OPTIONS}
          {...register('submission_method')}
        />

        <Select
          label={ANNUAL_REPORTS_MESSAGES.createModal.extensionReasonLabel}
          options={EXTENSION_REASON_OPTIONS}
          {...register('extension_reason')}
        />

        <FinancialFields register={register} />
        <TaxPreview preview={preview} />
        <RequiredAppendices register={register} />

        <Textarea label={GLOBAL_UI_MESSAGES.common.notes} rows={2} {...register('notes')} />
      </form>
    </Modal>
  )
}
