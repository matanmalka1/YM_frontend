import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { cn, formatCurrencyILS, formatPercent } from '../../../../utils/utils'
import { useTaxCalculationPanel } from '../../hooks/useTaxCalculationPanel'
import { TaxBracketsTable } from './TaxBracketsTable'
import { TaxCalculatorInputs } from './TaxCalculatorInputs'
import { getLiabilityTone, getTotalCredits } from '../../utils/taxHelpers'

interface Props {
  reportId: number
}

const Row: React.FC<{ label: string; value: string; className?: string; muted?: boolean }> = ({
  label,
  value,
  className,
  muted,
}) => (
  <div className="flex justify-between py-2 text-sm">
    <dt className={cn('text-gray-500', muted && 'text-gray-400 text-xs')}>{label}</dt>
    <dd className={cn('font-medium text-gray-900', className)}>{value}</dd>
  </div>
)

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card size="compact" disablePadding className="shadow-sm">
    <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
    </div>
    <dl className="divide-y divide-gray-50 px-5">{children}</dl>
  </Card>
)

export const TaxCalculationPanel: React.FC<Props> = ({ reportId }) => {
  const panel = useTaxCalculationPanel(reportId)
  const { data } = panel

  if (panel.isLoading) return <p className="py-8 text-center text-sm text-gray-400">מחשב מס...</p>
  if (panel.isError || !data) return <p className="py-8 text-center text-sm text-negative-500">שגיאה בטעינת חישוב מס</p>

  const totalLiability = data.total_liability == null ? null : Number(data.total_liability)
  const totalCredits = getTotalCredits(data)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-negative-100 bg-negative-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">מס לפני זיכויים</p>
          <p className="text-xl font-bold text-negative-700">{formatCurrencyILS(data.tax_before_credits)}</p>
        </div>
        <div className="rounded-xl border border-info-100 bg-info-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">זיכויי מס</p>
          <p className="text-xl font-bold text-info-700">{formatCurrencyILS(totalCredits)}</p>
        </div>
        <div className="rounded-xl border border-positive-100 bg-positive-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">מס סופי לתשלום</p>
          <p className="text-xl font-bold text-positive-700">{formatCurrencyILS(data.tax_after_credits)}</p>
        </div>
      </div>

      <TaxCalculatorInputs
        pension={panel.pension}
        otherCredits={panel.otherCredits}
        onPensionChange={panel.setPension}
        onOtherCreditsChange={panel.setOtherCredits}
        onSave={panel.saveInputs}
        onEditInit={panel.initializeInputs}
        isSaving={panel.isSavingInputs}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="חישוב מס הכנסה">
          <Row label="הכנסה חייבת" value={formatCurrencyILS(data.taxable_income)} />
          <Row label="ניכוי פנסיה" value={formatCurrencyILS(data.pension_deduction)} muted />
          <Row label="מס לפני זיכויים" value={formatCurrencyILS(data.tax_before_credits)} />
          <Row label="שווי נקודות זיכוי" value={formatCurrencyILS(data.credit_points_value)} muted />
          {Number(data.donation_credit) > 0 && (
            <Row label="זיכוי תרומות (סע׳ 46)" value={formatCurrencyILS(data.donation_credit)} muted />
          )}
          <Row
            label="שיעור אפקטיבי"
            value={formatPercent(data.effective_rate, { isRatio: true, fractionDigits: 2 })}
            muted
          />
          <Row
            label="מס לתשלום"
            value={formatCurrencyILS(data.tax_after_credits)}
            className="text-positive-700 font-semibold"
          />
        </SectionCard>
        <SectionCard title="ביטוח לאומי">
          <Row label="הכנסה מבוטחת" value={formatCurrencyILS(data.net_profit)} />
          <Row label="שיעור עד תקרה (5.97%)" value={formatCurrencyILS(data.national_insurance.base_amount)} muted />
          <Row label="שיעור מעל תקרה (17.83%)" value={formatCurrencyILS(data.national_insurance.high_amount)} muted />
          <Row
            label='סה"כ ביטוח לאומי'
            value={formatCurrencyILS(data.national_insurance.total)}
            className="font-semibold"
          />
        </SectionCard>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-1 shadow-sm">
        <dl className="divide-y divide-gray-100">
          <Row label="רווח נקי" value={formatCurrencyILS(data.net_profit)} />
          {totalLiability !== null && (
            <Row
              label='חבות כוללת (מס + בל + מע"מ − מקדמות)'
              value={formatCurrencyILS(totalLiability)}
              className={getLiabilityTone(totalLiability)}
            />
          )}
        </dl>
      </div>

      {panel.isAdvisor && data.total_liability != null && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={panel.saveTaxResult}
            isLoading={panel.isSavingTaxResult}
          >
            שמור חישוב מס
          </Button>
        </div>
      )}

      <TaxBracketsTable brackets={data.brackets} />
    </div>
  )
}

TaxCalculationPanel.displayName = 'TaxCalculationPanel'
