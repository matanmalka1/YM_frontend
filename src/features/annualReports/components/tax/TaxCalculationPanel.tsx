import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { cn, formatCurrencyILS, formatPercent } from '../../../../utils/utils'
import { useTaxCalculationPanel } from '../../hooks/useTaxCalculationPanel'
import { TaxBracketsTable } from './TaxBracketsTable'
import { TaxCalculatorInputs } from './TaxCalculatorInputs'
import { getLiabilityTone, getTotalCredits } from '../../utils/taxHelpers'
import { ANNUAL_REPORTS_MESSAGES } from '../../messages'
import { ANNUAL_REPORTS_ERROR_MESSAGES } from '../../errorMessages'

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

  if (panel.isLoading)
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        {ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.calculating}
      </p>
    )
  if (panel.isError || !data)
    return (
      <p className="py-8 text-center text-sm text-negative-500">
        {ANNUAL_REPORTS_ERROR_MESSAGES.taxCalculation.loadError}
      </p>
    )

  const totalLiability = data.total_liability == null ? null : Number(data.total_liability)
  const totalCredits = getTotalCredits(data)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-negative-100 bg-negative-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">{ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.taxBeforeCredits}</p>
          <p className="text-xl font-bold text-negative-700">{formatCurrencyILS(data.tax_before_credits)}</p>
        </div>
        <div className="rounded-xl border border-info-100 bg-info-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">{ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.taxCredits}</p>
          <p className="text-xl font-bold text-info-700">{formatCurrencyILS(totalCredits)}</p>
        </div>
        <div className="rounded-xl border border-positive-100 bg-positive-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">{ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.finalTaxDue}</p>
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
        <SectionCard title={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.incomeTaxSectionTitle}>
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.taxableIncome}
            value={formatCurrencyILS(data.taxable_income)}
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.pensionDeduction}
            value={formatCurrencyILS(data.pension_deduction)}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.taxBeforeCredits}
            value={formatCurrencyILS(data.tax_before_credits)}
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.creditPointsValue}
            value={formatCurrencyILS(data.credit_points_value)}
            muted
          />
          {Number(data.donation_credit) > 0 && (
            <Row
              label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.donationCredit}
              value={formatCurrencyILS(data.donation_credit)}
              muted
            />
          )}
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.effectiveRate}
            value={formatPercent(data.effective_rate, { isRatio: true, fractionDigits: 2 })}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.taxDue}
            value={formatCurrencyILS(data.tax_after_credits)}
            className="text-positive-700 font-semibold"
          />
        </SectionCard>
        <SectionCard title={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.nationalInsuranceSectionTitle}>
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.insuredIncome}
            value={formatCurrencyILS(data.net_profit)}
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.rateUpToCeiling}
            value={formatCurrencyILS(data.national_insurance.base_amount)}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.rateAboveCeiling}
            value={formatCurrencyILS(data.national_insurance.high_amount)}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.totalNationalInsurance}
            value={formatCurrencyILS(data.national_insurance.total)}
            className="font-semibold"
          />
        </SectionCard>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-1 shadow-sm">
        <dl className="divide-y divide-gray-100">
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.netProfit}
            value={formatCurrencyILS(data.net_profit)}
          />
          {totalLiability !== null && (
            <Row
              label={ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.totalLiability}
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
            {ANNUAL_REPORTS_MESSAGES.taxCalculationPanel.saveCalculation}
          </Button>
        </div>
      )}

      <TaxBracketsTable brackets={data.brackets} />
    </div>
  )
}

TaxCalculationPanel.displayName = 'TaxCalculationPanel'
