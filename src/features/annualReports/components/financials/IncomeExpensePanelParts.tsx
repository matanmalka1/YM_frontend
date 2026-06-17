import { useState, type ReactNode } from 'react'
import { Button } from '../../../../components/ui/primitives/Button'
import { Alert } from '../../../../components/ui/overlays/Alert'
import { StatsCard } from '../../../../components/ui/layout/StatsCard'
import { cn, formatCurrencyILS as fmt } from '../../../../utils/utils'
import type { IncomeSourceType, VatAutoPopulateResponse } from '../../api'
import { CATEGORY_LABELS as VAT_CATEGORY_LABELS } from '../../../vatReports'
import { EXPENSE_LABELS } from '../../report.constants'
import { FinancialAddFormShell, FinancialAmountDescriptionFields, FinancialSelectField } from './FinancialLineFormParts'
import {
  FIELD_PLACEHOLDERS,
  VAT_AUTO_POPULATE_ITEM_TYPE_LABELS,
  VAT_AUTO_POPULATE_SKIPPED_REASON_LABELS,
} from './financialConstants'
import { useIncomeLineForm } from './useFinancialLineForm'
import type { IncomeFormPayload } from './financialHelpers'

export interface AddLineFormProps {
  typeOptions: Record<IncomeSourceType, string>
  onAdd: (payload: IncomeFormPayload) => void
  isAdding: boolean
  label: string
}

export const AddLineForm: React.FC<AddLineFormProps> = ({ typeOptions, onAdd, isAdding, label }) => {
  const [open, setOpen] = useState(false)
  const form = useIncomeLineForm(undefined, (payload) => {
    onAdd(payload)
    form.reset()
    setOpen(false)
  })

  const close = () => {
    form.reset()
    setOpen(false)
  }

  return (
    <FinancialAddFormShell
      open={open}
      label={label}
      error={form.error}
      isSubmitting={isAdding}
      onOpen={() => setOpen(true)}
      onSubmit={form.submit}
      onCancel={close}
    >
      <FinancialSelectField
        value={form.typeKey}
        onChange={form.setTypeKey}
        options={typeOptions}
        placeholder={FIELD_PLACEHOLDERS.incomeType}
      />
      <FinancialAmountDescriptionFields
        amount={form.amount}
        onAmountChange={form.setAmount}
        description={form.description}
        onDescriptionChange={form.setDescription}
      />
    </FinancialAddFormShell>
  )
}

interface AutoPopulateControlsProps {
  showForceConfirm: boolean
  isPending: boolean
  onPopulate: (force: boolean) => void
  onCancelForce: () => void
}

export const AutoPopulateControls: React.FC<AutoPopulateControlsProps> = ({
  showForceConfirm,
  isPending,
  onPopulate,
  onCancelForce,
}) => (
  <div className="flex justify-end gap-2">
    {showForceConfirm ? (
      <>
        <span className="self-center text-sm text-warning-700">קיימות שורות — למחוק ולמלא מחדש?</span>
        <Button type="button" variant="outline" size="sm" onClick={onCancelForce}>
          ביטול
        </Button>
        <Button type="button" variant="danger" size="sm" onClick={() => onPopulate(true)} isLoading={isPending}>
          מחק ומלא מחדש
        </Button>
      </>
    ) : (
      <Button type="button" variant="ghost" size="sm" onClick={() => onPopulate(false)} isLoading={isPending}>
        מלא מנתוני מע"מ
      </Button>
    )}
  </div>
)

const getVatCategoryLabel = (category: string): string => VAT_CATEGORY_LABELS[category] ?? category

const getAnnualExpenseLabel = (category?: string | null): string | null =>
  category ? (EXPENSE_LABELS[category as keyof typeof EXPENSE_LABELS] ?? category) : null

interface AutoPopulateResultPanelProps {
  result: VatAutoPopulateResponse
  onDismiss?: () => void
}

export const AutoPopulateResultPanel: React.FC<AutoPopulateResultPanelProps> = ({ result, onDismiss }) => {
  const warnings = result.warnings ?? []
  const skippedItems = result.skipped_items ?? []
  const expenseBreakdown = result.expense_breakdown ?? []
  const hasWarnings = warnings.length > 0
  const hasSkippedItems = skippedItems.length > 0
  const hasExpenseBreakdown = expenseBreakdown.length > 0

  return (
    <div className="space-y-3 rounded-lg border border-info-100 bg-info-50/40 p-4" dir="rtl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-info-900">מילוי מנתוני מע"מ הושלם</h4>
            {onDismiss && (
              <Button type="button" variant="ghost" size="sm" onClick={onDismiss} className="md:hidden">
                הסתר
              </Button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-600">בקשה תקינה. פריטים לבדיקה אינם כשל בביצוע.</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="grid grid-cols-3 gap-2 text-xs sm:grid-cols-4 md:grid-cols-5">
            <ResultMetric label="שורות הכנסה" value={result.income_lines_created} />
            <ResultMetric label="שורות הוצאה" value={result.expense_lines_created} />
            {result.lines_deleted > 0 && <ResultMetric label="שורות שנמחקו" value={result.lines_deleted} />}
            <ResultMetric label='סה"כ הכנסה' value={fmt(result.income_total)} />
            <ResultMetric label='סה"כ הוצאה' value={fmt(result.expense_total)} />
          </div>
          {onDismiss && (
            <Button type="button" variant="ghost" size="sm" onClick={onDismiss} className="hidden shrink-0 md:flex">
              הסתר
            </Button>
          )}
        </div>
      </div>

      {hasWarnings && (
        <Alert
          variant="warning"
          size="sm"
          message={warnings.join(' · ')}
          className="rounded-lg border-warning-200 bg-warning-50"
        />
      )}

      {hasSkippedItems && (
        <section className="rounded-lg border border-warning-100 bg-white p-3">
          <h5 className="text-xs font-semibold text-warning-800">פריטים לבדיקה</h5>
          <div className="mt-2 divide-y divide-warning-50">
            {skippedItems.map((item, index) => {
              const annualCategory = getAnnualExpenseLabel(item.annual_category)
              return (
                <div key={`${item.item_type}-${item.source}-${item.reason}-${index}`} className="py-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {VAT_AUTO_POPULATE_ITEM_TYPE_LABELS[item.item_type]}
                    </span>
                    <span className="text-gray-500">·</span>
                    <span className="text-gray-700">{VAT_AUTO_POPULATE_SKIPPED_REASON_LABELS[item.reason]}</span>
                    <span className="mr-auto font-mono font-semibold tabular-nums text-warning-800">
                      {fmt(item.amount)}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-500">
                    מקור: {getVatCategoryLabel(item.source)}
                    {annualCategory ? ` · קטגוריית דוח: ${annualCategory}` : ''}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {hasExpenseBreakdown && (
        <section className="rounded-lg border border-gray-100 bg-white p-3">
          <h5 className="text-xs font-semibold text-gray-800">פירוט מקורות מע"מ לפי קטגוריית דוח</h5>
          <div className="mt-2 space-y-2">
            {expenseBreakdown.map((item) => (
              <div key={item.annual_category} className="rounded-md border border-gray-100 p-2">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-gray-800">{getAnnualExpenseLabel(item.annual_category)}</span>
                  <span className="font-mono font-semibold tabular-nums text-gray-700">{fmt(item.amount)}</span>
                </div>
                <div className="mt-2 grid gap-1 sm:grid-cols-2">
                  {Object.entries(item.source_vat_categories).map(([category, amount]) => (
                    <div key={`${item.annual_category}-${category}`} className="flex justify-between gap-2 text-xs">
                      <span className="text-gray-500">{getVatCategoryLabel(category)}</span>
                      <span className="font-mono tabular-nums text-gray-700">{fmt(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const ResultMetric: React.FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
  <div className="rounded-md border border-info-100 bg-white px-3 py-2 text-center">
    <p className="text-[11px] font-medium text-gray-500">{label}</p>
    <p className="mt-1 font-mono text-sm font-bold tabular-nums text-info-800">{value}</p>
  </div>
)

interface FinancialSummaryCardsProps {
  totalIncome: number
  totalExpenses: number
  taxableIncome: number
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  taxableIncome,
}) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    <StatsCard title='סה"כ הכנסות' value={fmt(totalIncome)} variant="green" />
    <StatsCard title='סה"כ הוצאות' value={fmt(totalExpenses)} variant="red" />
    <StatsCard title="הכנסה חייבת" value={fmt(taxableIncome)} variant={taxableIncome >= 0 ? 'blue' : 'red'} />
  </div>
)

interface FinancialSectionProps {
  icon: ReactNode
  title: string
  total: number
  titleClassName: string
  headerClassName: string
  totalClassName: string
  emptyMessage: string
  isEmpty: boolean
  children: ReactNode
  footer: ReactNode
}

export const FinancialSection: React.FC<FinancialSectionProps> = ({
  icon,
  title,
  total,
  titleClassName,
  headerClassName,
  totalClassName,
  emptyMessage,
  isEmpty,
  children,
  footer,
}) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div className={cn('flex items-center gap-2 border-b border-gray-100 px-5 py-3', headerClassName)}>
      {icon}
      <h4 className={cn('text-sm font-semibold', titleClassName)}>{title}</h4>
      <span className={cn('mr-auto text-xs font-medium', totalClassName)}>{fmt(total)}</span>
    </div>
    <div className="divide-y divide-gray-50 px-1">
      {isEmpty ? <p className="px-4 py-6 text-center text-sm text-gray-400">{emptyMessage}</p> : null}
      {children}
    </div>
    <div className="px-4 pb-3 pt-2">{footer}</div>
  </div>
)
