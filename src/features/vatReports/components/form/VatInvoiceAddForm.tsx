import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/inputs/Input'
import { Select } from '@/components/ui/inputs/Select'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import { vatInvoiceRowSchema, toInvoiceRowPayload, type VatInvoiceRowValues } from '../../schemas/invoice.schema'
import {
  DEFAULT_RATE_TYPE,
  DOCUMENT_TYPE_OPTIONS,
  VAT_EXPENSE_CATEGORY_OPTIONS,
  VAT_RATE_TYPE_OPTIONS,
} from '../../constants/vatConstants'
import { getVatInvoiceDefaultValues } from '../../utils/vatHelpers'
import type { VatInvoiceAddFormProps } from '../../types'
import { blockNonNumericKey, getDeductionRateHint, shouldRequireCounterpartyId } from '../../utils/viewHelpers'
import { VAT_MESSAGES } from '../../messages'
import { GLOBAL_UI_MESSAGES } from '@/messages'

export const VatInvoiceAddForm: React.FC<VatInvoiceAddFormProps> = ({ invoiceType, addInvoice, isAdding, onCancel }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<VatInvoiceRowValues>({
    resolver: zodResolver(vatInvoiceRowSchema),
    defaultValues: {
      ...getVatInvoiceDefaultValues(invoiceType),
      rate_type: DEFAULT_RATE_TYPE,
    },
  })

  const isExpense = invoiceType === 'expense'
  const selectedCategory = watch('expense_category')
  const selectedDocumentType = watch('document_type')
  const deductionRateHint = getDeductionRateHint(selectedCategory)
  const requiresCounterpartyId = shouldRequireCounterpartyId(invoiceType, selectedDocumentType)

  const onSubmit = async (values: VatInvoiceRowValues) => {
    const ok = await addInvoice(toInvoiceRowPayload(values))
    if (ok) reset({ ...getVatInvoiceDefaultValues(invoiceType), rate_type: DEFAULT_RATE_TYPE })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-4">
      <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
        {/* Required: amount */}
        <Input
          {...register('gross_amount')}
          label={VAT_MESSAGES.form.grossAmountLabel}
          error={errors.gross_amount?.message}
          fieldClassName="w-36 shrink-0"
          placeholder="0.00"
          dir="ltr"
          inputMode="decimal"
          autoFocus={!isExpense}
          onKeyDown={(e) => blockNonNumericKey(e, true)}
        />

        {/* Required: date */}
        <Controller
          control={control}
          name="invoice_date"
          render={({ field }) => (
            <DatePicker
              label={VAT_MESSAGES.form.invoiceDateLabel}
              error={errors.invoice_date?.message}
              fieldClassName="w-36 shrink-0"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        {/* VAT type */}
        <Controller
          control={control}
          name="rate_type"
          render={({ field }) => (
            <Select
              label={VAT_MESSAGES.form.vatTypeLabel}
              fieldClassName="w-32 shrink-0"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={VAT_RATE_TYPE_OPTIONS}
            />
          )}
        />

        {/* Expense-only: category */}
        {isExpense && (
          <Controller
            control={control}
            name="expense_category"
            render={({ field }) => (
              <Select
                label={VAT_MESSAGES.form.categoryLabel}
                error={errors.expense_category?.message}
                fieldClassName="w-44 shrink-0"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={VAT_EXPENSE_CATEGORY_OPTIONS}
              />
            )}
          />
        )}

        {/* Expense-only: document type */}
        {isExpense && (
          <Controller
            control={control}
            name="document_type"
            render={({ field }) => (
              <Select
                label={VAT_MESSAGES.form.documentTypeLabel}
                error={errors.document_type?.message}
                fieldClassName="w-40 shrink-0"
                name={field.name}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={[{ value: '', label: VAT_MESSAGES.form.selectPlaceholder }, ...DOCUMENT_TYPE_OPTIONS]}
              />
            )}
          />
        )}

        {/* Optional: invoice number */}
        <Input
          {...register('invoice_number')}
          label={VAT_MESSAGES.form.invoiceNumberLabel}
          fieldClassName="w-36 shrink-0"
          placeholder={VAT_MESSAGES.form.optionalPlaceholder}
        />

        {/* Optional: counterparty name */}
        <Input
          {...register('counterparty_name')}
          label={VAT_MESSAGES.form.counterpartyNameLabel}
          fieldClassName="w-44 shrink-0"
          placeholder={VAT_MESSAGES.form.optionalPlaceholder}
        />

        {/* Conditional: counterparty ID (tax invoice expense only) */}
        {requiresCounterpartyId && (
          <Input
            {...register('counterparty_id')}
            label={VAT_MESSAGES.form.counterpartyIdLabel}
            error={errors.counterparty_id?.message}
            fieldClassName="w-36 shrink-0"
            placeholder={VAT_MESSAGES.form.counterpartyIdPlaceholder}
            dir="ltr"
            inputMode="numeric"
            onKeyDown={(e) => blockNonNumericKey(e)}
          />
        )}

        {/* Deduction rate hint inline with submit */}
        <div className="flex items-end gap-3 pb-0.5">
          {isExpense && deductionRateHint && (
            <span className={`text-xs font-medium ${deductionRateHint.className}`}>{deductionRateHint.label}</span>
          )}
          <Button type="submit" variant="ghost" size="sm" icon={<Plus className="h-3.5 w-3.5" />} isLoading={isAdding}>
            {GLOBAL_UI_MESSAGES.actions.add}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              {GLOBAL_UI_MESSAGES.actions.cancel}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

VatInvoiceAddForm.displayName = 'VatInvoiceAddForm'
