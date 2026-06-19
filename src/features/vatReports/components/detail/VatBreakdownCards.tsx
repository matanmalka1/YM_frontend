import { ChevronLeft } from 'lucide-react'
import { formatVatAmount } from '../../utils/vatHelpers'
import type { VatBreakdownData } from '../../utils/vatBreakdown'

interface VatOutputCardProps {
  data: VatBreakdownData
  onNavigate?: () => void
}
interface VatInputCardProps {
  data: VatBreakdownData
  onNavigate?: () => void
}

type VatCardTone = 'positive' | 'warning'

interface VatCardProps {
  title: string
  tone: VatCardTone
  onNavigate?: () => void
  children: React.ReactNode
}

const VAT_CARD_CLASSES: Record<VatCardTone, { border: string; title: string; button: string }> = {
  positive: {
    border: 'border-r-positive-400',
    title: 'text-positive-700',
    button: 'text-positive-600 hover:text-positive-800',
  },
  warning: {
    border: 'border-r-warning-400',
    title: 'text-warning-700',
    button: 'text-warning-600 hover:text-warning-800',
  },
}

const VatCard: React.FC<VatCardProps> = ({ title, tone, onNavigate, children }) => {
  const classes = VAT_CARD_CLASSES[tone]
  return (
    <div className={`rounded-xl border border-gray-100 border-r-2 ${classes.border} bg-white p-4 shadow-sm`} dir="rtl">
      <div className="mb-3 flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wide ${classes.title}`}>{title}</p>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors hover:bg-gray-50 ${classes.button}`}
            aria-label="עבור לפרטים"
          >
            צפה בפירוט
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ── Output (income) card ──────────────────────────────────────────────────────

export const VatOutputCard: React.FC<VatOutputCardProps> = ({ data, onNavigate }) => (
  <VatCard title='מע"מ עסקאות – מכירות' tone="positive" onNavigate={onNavigate}>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-500">
        <span>סה&quot;כ מכירות (ללא מע&quot;מ)</span>
        <span className="font-mono tabular-nums">{formatVatAmount(data.totalIncomeNet)}</span>
      </div>
      <div className="flex justify-between text-gray-400">
        <span>שיעור מע&quot;מ</span>
        <span className="font-mono">לפי שיעור המערכת</span>
      </div>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
      <span className="text-sm font-semibold text-gray-700">מע&quot;מ עסקאות</span>
      <span className="font-mono text-2xl font-bold text-positive-700 tabular-nums">
        {formatVatAmount(data.totalOutputVat)}
      </span>
    </div>
  </VatCard>
)

VatOutputCard.displayName = 'VatOutputCard'

// ── Input (expense) card ──────────────────────────────────────────────────────

export const VatInputCard: React.FC<VatInputCardProps> = ({ data, onNavigate }) => (
  <VatCard title='מע"מ תשומות – הוצאות' tone="warning" onNavigate={onNavigate}>
    {data.totalExpenseNet > 0 && data.totalInputVat === 0 && (
      <div className="mb-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
        הוצאות אלו אינן מזכות בניכוי מע&quot;מ לפי הקטגוריות שהוזנו.
      </div>
    )}
    <div className="space-y-1.5 text-sm">
      {data.expenseRows.map((row) => (
        <div key={row.categoryKey} className="flex justify-between">
          <span className="text-gray-500">
            {row.label}
            {row.deductionRate < 1 && row.deductionRate > 0 && (
              <span className="mr-1 text-xs text-gray-400">({Math.round(row.deductionRate * 100)}%)</span>
            )}
          </span>
          <span className="font-mono tabular-nums text-warning-700">{formatVatAmount(row.deductibleVat)}</span>
        </div>
      ))}
    </div>
    <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-sm">
      <div className="flex justify-between text-gray-500">
        <span>סה&quot;כ הוצאות (ללא מע&quot;מ)</span>
        <span className="font-mono tabular-nums">{formatVatAmount(data.totalExpenseNet)}</span>
      </div>
      <div className="flex justify-between text-gray-500">
        <span>מע&quot;מ בחשבוניות</span>
        <span className="font-mono tabular-nums">{formatVatAmount(data.totalGrossVat)}</span>
      </div>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
      <span className="text-sm font-semibold text-gray-700">מע&quot;מ תשומות לניכוי</span>
      <span className="font-mono text-2xl font-bold text-warning-700 tabular-nums">
        {formatVatAmount(data.totalInputVat)}
      </span>
    </div>
  </VatCard>
)

VatInputCard.displayName = 'VatInputCard'
