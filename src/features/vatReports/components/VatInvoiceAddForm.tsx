import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/primitives/Button'
import { FormField } from '../../../components/ui/inputs/FormField'
import { Input } from '../../../components/ui/inputs/Input'
import { Select } from '../../../components/ui/inputs/Select'
import { DatePicker } from '../../../components/ui/inputs/DatePicker'
import { vatInvoiceRowSchema, toInvoiceRowPayload, type VatInvoiceRowValues } from '../schemas/invoice.schema'
import {
  DEFAULT_RATE_TYPE,
  DOCUMENT_TYPE_OPTIONS,
  VAT_EXPENSE_CATEGORY_OPTIONS,
  VAT_RATE_TYPE_OPTIONS,
} from '../constants'
import { getVatInvoiceDefaultValues } from '../utils'
import type { VatInvoiceAddFormProps } from '../types'
import { blockNonNumericKey, getDeductionRateHint, shouldRequireCounterpartyId } from '../view.helpers'

export const VatInvoiceAddForm: React.FC<VatInvoiceAddFormProps> = ({
  invoiceType,
  addInvoice,
  isAdding,
  onCancel,
}) => {
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      dir="rtl"
      className="rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-4"
    >
      <div className="flex flex-wrap items-end gap-x-3 gap-y-3">
        {/* Required: amount */}
        <FormField label="סכום נטו ₪" error={errors.net_amount?.message} className="w-32 shrink-0">
          <Input
            {...register('net_amount')}
            placeholder="0.00"
            dir="ltr"
            inputMode="decimal"
            autoFocus={!isExpense}
            onKeyDown={(e) => blockNonNumericKey(e, true)}
          />
        </FormField>

        {/* Required: date */}
        <FormField label="תאריך חשבונית" error={errors.invoice_date?.message} className="w-36 shrink-0">
          <Controller
            control={control}
            name="invoice_date"
            render={({ field }) => (
              <DatePicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} noWrapper />
            )}
          />
        </FormField>

        {/* VAT type */}
        <Controller
          control={control}
          name="rate_type"
          render={({ field }) => (
            <Select
              label='סוג מע"מ'
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
                label="קטגוריה"
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
                label="סוג מסמך"
                error={errors.document_type?.message}
                fieldClassName="w-40 shrink-0"
                name={field.name}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                options={[{ value: '', label: '— בחר —' }, ...DOCUMENT_TYPE_OPTIONS]}
              />
            )}
          />
        )}

        {/* Optional: invoice number */}
        <FormField label="מספר חשבונית" className="w-36 shrink-0">
          <Input {...register('invoice_number')} placeholder="לא חובה" />
        </FormField>

        {/* Optional: counterparty name */}
        <FormField label="שם ספק / לקוח" className="w-44 shrink-0">
          <Input {...register('counterparty_name')} placeholder="לא חובה" />
        </FormField>

        {/* Conditional: counterparty ID (tax invoice expense only) */}
        {requiresCounterpartyId && (
          <FormField label="מספר עוסק של הספק" error={errors.counterparty_id?.message} className="w-36 shrink-0">
            <Input
              {...register('counterparty_id')}
              placeholder="9 ספרות"
              dir="ltr"
              inputMode="numeric"
              onKeyDown={(e) => blockNonNumericKey(e)}
            />
          </FormField>
        )}

        {/* Deduction rate hint inline with submit */}
        <div className="flex items-end gap-3 pb-0.5">
          {isExpense && deductionRateHint && (
            <span className={`text-xs font-medium ${deductionRateHint.className}`}>{deductionRateHint.label}</span>
          )}
          <Button type="submit" variant="ghost" size="sm" isLoading={isAdding}>
            <Plus className="h-3.5 w-3.5" />
            הוסף
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              ביטול
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}

VatInvoiceAddForm.displayName = 'VatInvoiceAddForm'
