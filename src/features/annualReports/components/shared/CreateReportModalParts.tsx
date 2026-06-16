import { Input, Select } from '@/components/ui/inputs'
import { FLAG_FIELDS } from '../../utils'
import { semanticMonoToneClasses } from '@/utils/semanticColors'
import { formatCurrencyILS } from '@/utils/utils'

const currencySuffix = <span className="text-sm text-gray-400">₪</span>

interface FinancialFieldsProps {
  register: (name: never) => object
}

export const FinancialFields = ({ register }: FinancialFieldsProps) => (
  <div>
    <p className="mb-2 text-sm font-medium text-gray-700">נתוני הכנסות ראשוניים (לתצוגה בלבד)</p>
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="הכנסה ברוטו"
        type="number"
        min={0}
        endElement={currencySuffix}
        {...register('gross_income' as never)}
      />
      <Input label="הוצאות" type="number" min={0} endElement={currencySuffix} {...register('expenses' as never)} />
      <Input
        label="מקדמות ששולמו"
        type="number"
        min={0}
        endElement={currencySuffix}
        {...register('advances_paid' as never)}
      />
      <div>
        <Input label="נקודות זיכוי" type="number" min={0} step={0.25} {...register('credit_points' as never)} />
        <p className="mt-1 text-xs text-gray-500">לצורך הצגת אומדן בלבד — לא נשמר בדוח</p>
      </div>
    </div>
  </div>
)

interface PreviewProps {
  preview: { netProfit: number; estimatedTax: number; balance: number }
}

export const TaxPreview = ({ preview }: PreviewProps) => (
  <div className="rounded-lg border border-info-200 bg-info-50 p-3 text-sm">
    <p className="mb-1.5 font-medium text-info-800">תצוגה מקדימה (אומדן)</p>
    <div className="grid grid-cols-3 gap-2 text-info-700">
      <PreviewValue label="רווח נקי" value={preview.netProfit} />
      <PreviewValue label="מס משוער" value={preview.estimatedTax} />
      <div>
        <span className="block text-xs text-info-500">יתרה לתשלום</span>
        <span
          className={`font-mono ${preview.balance < 0 ? semanticMonoToneClasses.positive : semanticMonoToneClasses.negative}`}
        >
          {formatCurrencyILS(Math.abs(preview.balance))}
          {preview.balance < 0 ? ' (החזר)' : ''}
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
    <p className="mb-2 text-sm font-medium text-gray-700">נספחים נדרשים</p>
    <div className="space-y-2 rounded-lg border border-gray-200 p-3">
      {FLAG_FIELDS.map(({ name, label }) => (
        <label key={name} className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary-600"
            {...register(name as never)}
          />
          <span className="text-gray-700">{label}</span>
        </label>
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
