import { Input, Select } from '@/components/ui/inputs'
import { Checkbox } from '@/components/ui/primitives/Checkbox'
import { FLAG_FIELDS } from '../../utils/annualReportsUtils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { formatCurrencyILS } from '@/utils/utils'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'

const currencySuffix = <span className="text-sm text-gray-400">₪</span>

interface FinancialFieldsProps {
  register: (name: never) => object
}

export const FinancialFields = ({ register }: FinancialFieldsProps) => (
  <div>
    <p className="mb-2 text-sm font-medium text-gray-700">
      {ANNUAL_REPORTS_MESSAGES.createModalParts.initialIncomeNote}
    </p>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label={ANNUAL_REPORTS_MESSAGES.createModalParts.grossIncome}
        type="number"
        min={0}
        endElement={currencySuffix}
        {...register('gross_income' as never)}
      />
      <Input
        label={ANNUAL_REPORTS_MESSAGES.createModalParts.expenses}
        type="number"
        min={0}
        endElement={currencySuffix}
        {...register('expenses' as never)}
      />
      <Input
        label={ANNUAL_REPORTS_MESSAGES.createModalParts.advancesPaid}
        type="number"
        min={0}
        endElement={currencySuffix}
        {...register('advances_paid' as never)}
      />
      <div>
        <Input
          label={ANNUAL_REPORTS_MESSAGES.createModalParts.creditPoints}
          type="number"
          min={0}
          step={0.25}
          {...register('credit_points' as never)}
        />
        <p className="mt-1 text-xs text-gray-500">{ANNUAL_REPORTS_MESSAGES.createModalParts.creditPointsNote}</p>
      </div>
    </div>
  </div>
)

interface PreviewProps {
  preview: { netProfit: number; estimatedTax: number; balance: number }
}

export const TaxPreview = ({ preview }: PreviewProps) => (
  <div className="rounded-lg border border-info-200 bg-info-50 p-3 text-sm">
    <p className="mb-1.5 font-medium text-info-800">{ANNUAL_REPORTS_MESSAGES.createModalParts.previewTitle}</p>
    <div className="grid grid-cols-3 gap-2 text-info-700">
      <PreviewValue label={ANNUAL_REPORTS_MESSAGES.createModalParts.netProfit} value={preview.netProfit} />
      <PreviewValue label={ANNUAL_REPORTS_MESSAGES.createModalParts.estimatedTax} value={preview.estimatedTax} />
      <div>
        <span className="block text-xs text-info-500">{ANNUAL_REPORTS_MESSAGES.createModalParts.balanceDue}</span>
        <span
          className={`font-mono ${preview.balance < 0 ? semanticMonoToneClasses.positive : semanticMonoToneClasses.negative}`}
        >
          {formatCurrencyILS(Math.abs(preview.balance))}
          {preview.balance < 0 ? ANNUAL_REPORTS_MESSAGES.createModalParts.refundSuffix : ''}
        </span>
      </div>
    </div>
  </div>
)

const PreviewValue = ({ label, value }: { label: string; value: number }) => (
  <div>
    <span className="block text-xs text-info-500">{label}</span>
    <span className="font-mono">{formatCurrencyILS(value)}</span>
  </div>
)

export const RequiredAppendices = ({ register }: FinancialFieldsProps) => (
  <div>
    <p className="mb-2 text-sm font-medium text-gray-700">
      {ANNUAL_REPORTS_MESSAGES.createModalParts.requiredAppendicesNote}
    </p>
    <div className="space-y-2 rounded-lg border border-gray-200 p-3">
      {FLAG_FIELDS.map(({ name, label }) => (
        <Checkbox key={name} label={label} {...register(name as never)} />
      ))}
    </div>
  </div>
)

interface SelectOptionsProps {
  label: string
  options: { value: string; label: string }[]
  error?: string
  registerProps: object
}

export const SelectOptions = ({ label, options, error, registerProps }: SelectOptionsProps) => (
  <Select label={label} error={error} options={options} {...registerProps} />
)
