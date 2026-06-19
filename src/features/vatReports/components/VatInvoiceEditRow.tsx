import { useForm, Controller, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Input } from '@/components/ui/inputs/Input'
import { SelectDropdown } from '@/components/ui/inputs/SelectDropdown'
import { DatePicker } from '@/components/ui/inputs/DatePicker'
import {
  vatInvoiceEditSchema,
  isCounterpartyIdType,
  toInvoiceEditPayload,
  type VatInvoiceEditValues,
} from '../schemas/invoice.schema'
import { EXPENSE_CATEGORIES, CATEGORY_COLORS, VAT_EXPENSE_CATEGORY_OPTIONS } from '../constants'
import {
  formatVatAmount,
  getVatDeductionRateClass,
  getVatDeductionRateLabel,
  getVatInvoiceGrossAmount,
  isGeneratedVatInvoiceNumber,
  toDateInputValue,
} from '../utils/vatHelpers'
import type { VatInvoiceEditRowProps } from '../types'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { blockNonNumericKey } from '../utils/viewHelpers'

export const VatInvoiceEditRow: React.FC<VatInvoiceEditRowProps> = ({
  invoice,
  sectionType,
  accentBorder,
  onSave,
  onCancel,
  isSaving,
}) => {
  const counterpartyIdType = isCounterpartyIdType(invoice.counterparty_id_type)
    ? invoice.counterparty_id_type
    : undefined

  const { register, handleSubmit, control } = useForm<VatInvoiceEditValues>({
    resolver: zodResolver(vatInvoiceEditSchema),
    defaultValues: {
      gross_amount: getVatInvoiceGrossAmount(invoice.net_amount, invoice.vat_amount),
      expense_category: invoice.expense_category ?? undefined,
      invoice_number: isGeneratedVatInvoiceNumber(invoice) ? '' : invoice.invoice_number,
      invoice_date: toDateInputValue(invoice.invoice_date),
      counterparty_name: invoice.counterparty_name,
      counterparty_id: invoice.counterparty_id ?? undefined,
      counterparty_id_type: counterpartyIdType,
    },
  })

  const onSubmit: SubmitHandler<VatInvoiceEditValues> = async (values) => {
    const ok = await onSave(toInvoiceEditPayload(values))
    if (ok) onCancel()
  }

  const selectedCategory = invoice.expense_category ?? EXPENSE_CATEGORIES[0]
  const catColor = selectedCategory ? CATEGORY_COLORS[selectedCategory] : ''
  const handleEscapeKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <tr className="bg-info-50/40">
      <td className={`border-r-2 ${accentBorder} px-2 py-1.5`}>
        <Input {...register('invoice_number')} onKeyDown={handleEscapeKeyDown} size="xs" className="w-28 font-mono" />
      </td>
      <td className="px-2 py-1.5 w-32">
        <Controller
          control={control}
          name="invoice_date"
          render={({ field }) => (
            <DatePicker
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              onKeyDown={handleEscapeKeyDown}
              compact
              noWrapper
              usePortal
            />
          )}
        />
      </td>
      <td className="px-2 py-1.5">
        <Input {...register('counterparty_name')} onKeyDown={handleEscapeKeyDown} size="xs" className="w-36" />
      </td>
      <td className="px-2 py-1.5">
        <Input
          {...register('counterparty_id')}
          onKeyDown={handleEscapeKeyDown}
          size="xs"
          className="w-28 font-mono"
          placeholder="—"
          dir="ltr"
        />
      </td>
      <td className="px-2 py-1.5 text-xs text-gray-400">—</td>
      <td className="px-2 py-1.5 text-xs text-gray-400">—</td>
      {sectionType === 'expense' && (
        <td className="px-2 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 shrink-0 rounded-full ${catColor || 'bg-gray-300'}`} />
            <Controller
              control={control}
              name="expense_category"
              render={({ field }) => (
                <SelectDropdown
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  onKeyDown={handleEscapeKeyDown}
                  size="xs"
                  className="flex-1"
                  options={VAT_EXPENSE_CATEGORY_OPTIONS}
                />
              )}
            />
          </div>
        </td>
      )}
      <td className="px-2 py-1.5 whitespace-nowrap">
        <span className={getVatDeductionRateClass(invoice.deduction_rate)}>
          {getVatDeductionRateLabel(invoice.deduction_rate)}
        </span>
      </td>
      <td className="px-2 py-1.5">
        <Input
          {...register('gross_amount')}
          dir="ltr"
          size="xs"
          className="w-24 font-mono"
          inputMode="decimal"
          aria-label='סכום כולל מע"מ'
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              onCancel()
              return
            }
            blockNonNumericKey(e, true)
          }}
        />
      </td>
      <td className="px-2 py-1.5 text-xs text-gray-400">—</td>
      {sectionType === 'expense' && (
        <td className={`px-2 py-1.5 font-mono text-xs ${semanticMonoToneClasses.positive}`}>
          {formatVatAmount(Number(invoice.vat_amount) * Number(invoice.deduction_rate))}
        </td>
      )}
      <td className="px-2 py-1.5 text-xs text-gray-400 font-mono">#{invoice.created_by}</td>
      <td className="px-2 py-1.5 text-xs text-gray-400">—</td>
      <td className="px-2 py-1.5">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            onKeyDown={handleEscapeKeyDown}
            disabled={isSaving}
            className="p-1 text-positive-600 hover:bg-positive-50 hover:text-positive-600"
            aria-label="שמור"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            onKeyDown={handleEscapeKeyDown}
            className="p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="ביטול"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

VatInvoiceEditRow.displayName = 'VatInvoiceEditRow'
