import { useEffect } from 'react'
import { ClientPickerField, createClientIdPickerHandlers, useClientPickerState } from '@/components/shared/client'
import { Input, Textarea } from '@/components/ui/inputs'
import { Modal, ModalFormActions } from '@/components/ui/overlays'
import { useCreateReport } from '../../hooks/useCreateReport'
import { SUBMISSION_METHOD_OPTIONS } from '../../constants/submissionMethodOptions'
import {
  CLIENT_TYPE_OPTIONS,
  DEADLINE_TYPE_OPTIONS,
  EXTENSION_REASON_OPTIONS,
  TAX_YEAR_LIMITS,
} from '../../constants/sharedConstants'
import { FinancialFields, RequiredAppendices, SelectOptions, TaxPreview } from './CreateReportModalParts'

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
  const {
    clientQuery,
    selectedClient,
    handleSelectClient,
    handleClearClient,
    handleClientQueryChange,
    resetClientPicker,
  } = useClientPickerState(createClientIdPickerHandlers((value, options) => setValue('client_id', value, options)))

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
      title="דוח שנתי חדש"
      onClose={handleClose}
      footer={
        <ModalFormActions onCancel={handleClose} onSubmit={onSubmit} isLoading={isSubmitting} submitLabel="צור דוח" />
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" {...register('client_id')} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ClientPickerField
              selectedClient={selectedClient}
              clientQuery={clientQuery}
              onQueryChange={handleClientQueryChange}
              onSelect={handleSelectClient}
              onClear={handleClearClient}
              error={errors.client_id?.message}
              label="לקוח *"
            />
          </div>
          <Input
            label="שנת מס *"
            type="number"
            min={TAX_YEAR_LIMITS.min}
            max={TAX_YEAR_LIMITS.max}
            error={errors.tax_year?.message}
            {...register('tax_year')}
          />
        </div>

        <SelectOptions
          label="סוג לקוח *"
          options={CLIENT_TYPE_OPTIONS}
          error={errors.client_type?.message}
          registerProps={register('client_type')}
        />

        <SelectOptions
          label="סוג מועד"
          options={DEADLINE_TYPE_OPTIONS}
          error={errors.deadline_type?.message}
          registerProps={register('deadline_type')}
        />

        <SelectOptions
          label="שיטת הגשה"
          options={SUBMISSION_METHOD_OPTIONS}
          registerProps={register('submission_method')}
        />

        <SelectOptions
          label="סיבת הארכה"
          options={EXTENSION_REASON_OPTIONS}
          registerProps={register('extension_reason')}
        />

        <FinancialFields register={register} />
        <TaxPreview preview={preview} />
        <RequiredAppendices register={register} />

        <Textarea label="הערות" rows={2} {...register('notes')} />
      </form>
    </Modal>
  )
}
