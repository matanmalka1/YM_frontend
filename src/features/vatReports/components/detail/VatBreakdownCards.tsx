import { ChevronLeft } from 'lucide-react'
import { Alert } from '@/components/ui/overlays/Alert'
import { Button } from '@/components/ui/primitives/Button'
import { Card } from '@/components/ui/primitives/Card'
import { cn } from '@/utils/utils'
import { semanticStatToneClasses } from '@/utils/semanticColors'
import { formatVatAmount } from '../../utils/vatHelpers'
import type { VatBreakdown } from '../../api'
import { VAT_MESSAGES } from '../../messages'

interface VatOutputCardProps {
  data: VatBreakdown
  onNavigate?: () => void
}
interface VatInputCardProps {
  data: VatBreakdown
  onNavigate?: () => void
}

type VatCardTone = 'positive' | 'warning'

interface VatCardProps {
  title: string
  tone: VatCardTone
  onNavigate?: () => void
  children: React.ReactNode
}

interface VatAmountRowProps {
  label: React.ReactNode
  value: React.ReactNode
  className?: string
  valueClassName?: string
}

interface VatTotalRowProps {
  label: string
  value: string
  tone: VatCardTone
  className?: string
}

const VAT_CARD_CLASSES: Record<VatCardTone, { border: string; buttonVariant: 'linkPositive' | 'linkWarning' }> = {
  positive: {
    border: 'border-r-positive-400',
    buttonVariant: 'linkPositive',
  },
  warning: {
    border: 'border-r-warning-400',
    buttonVariant: 'linkWarning',
  },
}

const VatAmountRow: React.FC<VatAmountRowProps> = ({ label, value, className, valueClassName }) => (
  <div className={cn('flex justify-between text-gray-500', className)}>
    <span>{label}</span>
    <span className={cn('font-mono tabular-nums', valueClassName)}>{value}</span>
  </div>
)

const VatTotalRow: React.FC<VatTotalRowProps> = ({ label, value, tone, className }) => (
  <div className={cn('flex items-center justify-between border-t border-gray-100 pt-3', className)}>
    <span className="text-sm font-semibold text-gray-700">{label}</span>
    <span className={cn('font-mono text-2xl font-bold tabular-nums', semanticStatToneClasses[tone].value)}>
      {value}
    </span>
  </div>
)

const VatCard: React.FC<VatCardProps> = ({ title, tone, onNavigate, children }) => {
  const classes = VAT_CARD_CLASSES[tone]
  return (
    <Card variant="outlined" size="compact" className={cn('border-r-2', classes.border)}>
      <div className="mb-3 flex items-center justify-between">
        <p className={cn('text-xs font-semibold uppercase tracking-wide', semanticStatToneClasses[tone].value)}>
          {title}
        </p>
        {onNavigate && (
          <Button
            type="button"
            variant={classes.buttonVariant}
            size="sm"
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={onNavigate}
            aria-label={VAT_MESSAGES.actions.goToDetails}
          >
            {VAT_MESSAGES.actions.viewDetails}
          </Button>
        )}
      </div>
      {children}
    </Card>
  )
}

// ── Output (income) card ──────────────────────────────────────────────────────

export const VatOutputCard: React.FC<VatOutputCardProps> = ({ data, onNavigate }) => (
  <VatCard title={VAT_MESSAGES.breakdown.outputTitle} tone="positive" onNavigate={onNavigate}>
    <div className="space-y-2 text-sm">
      <VatAmountRow label={VAT_MESSAGES.breakdown.totalIncomeNet} value={formatVatAmount(data.income_net)} />
      <VatAmountRow
        label={VAT_MESSAGES.breakdown.vatRate}
        value={VAT_MESSAGES.breakdown.systemRate}
        className="text-gray-400"
      />
    </div>
    <VatTotalRow
      label={VAT_MESSAGES.breakdown.outputVat}
      value={formatVatAmount(data.total_output_vat)}
      tone="positive"
      className="mt-4"
    />
  </VatCard>
)

VatOutputCard.displayName = 'VatOutputCard'

// ── Input (expense) card ──────────────────────────────────────────────────────

export const VatInputCard: React.FC<VatInputCardProps> = ({ data, onNavigate }) => (
  <VatCard title={VAT_MESSAGES.breakdown.inputTitle} tone="warning" onNavigate={onNavigate}>
    {Number(data.total_expense_net) > 0 && Number(data.total_input_vat) === 0 && (
      <Alert variant="neutral" size="sm" message={VAT_MESSAGES.breakdown.nonDeductibleExpenseNote} className="mb-3" />
    )}
    <div className="space-y-1.5 text-sm">
      {data.expenses.map((row) => (
        <VatAmountRow
          key={`${row.category}-${row.deduction_rate}`}
          label={
            <>
              {row.label}
              {Number(row.deduction_rate) < 1 && Number(row.deduction_rate) > 0 && (
                <span className="mr-1 text-xs text-gray-400">({Math.round(Number(row.deduction_rate) * 100)}%)</span>
              )}
            </>
          }
          value={formatVatAmount(row.deductible_vat)}
          valueClassName="text-warning-700"
        />
      ))}
    </div>
    <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
      <VatAmountRow label={VAT_MESSAGES.breakdown.totalExpenseNet} value={formatVatAmount(data.total_expense_net)} />
      <VatAmountRow label={VAT_MESSAGES.breakdown.invoiceVat} value={formatVatAmount(data.total_gross_vat)} />
    </div>
    <VatTotalRow
      label={VAT_MESSAGES.breakdown.deductibleInputVat}
      value={formatVatAmount(data.total_input_vat)}
      tone="warning"
      className="mt-3"
    />
  </VatCard>
)

VatInputCard.displayName = 'VatInputCard'
