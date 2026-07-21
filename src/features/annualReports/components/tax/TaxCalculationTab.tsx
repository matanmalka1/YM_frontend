import { Button } from '../../../../components/ui/primitives/Button'
import { Card } from '../../../../components/ui/primitives/Card'
import { DefinitionList } from '../../../../components/ui/layout/DefinitionList'
import { cn, formatCurrencyILS, formatPercent } from '../../../../utils/utils'
import { semanticMonoToneClasses } from '../../../../utils/semanticColors'
import { useTaxCalculationTab } from '../../hooks/useTaxCalculationTab'
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

export const TaxCalculationTab: React.FC<Props> = ({ reportId }) => {
  const panel = useTaxCalculationTab(reportId)
  const { data } = panel

  if (panel.isLoading)
    return <p className="py-8 text-center text-sm text-gray-400">{ANNUAL_REPORTS_MESSAGES.taxCalculationTab.calculating}</p>
  if (panel.isError || !data)
    return <p className="py-8 text-center text-sm text-negative-500">{ANNUAL_REPORTS_ERROR_MESSAGES.taxCalculation.loadError}</p>

  const totalLiability = data.total_liability == null ? null : Number(data.total_liability)
  const totalCredits = getTotalCredits(data)

  return (
    <div className="space-y-5">
      <Card size="compact" className="shadow-sm">
        <DefinitionList
          columns={3}
          className="text-center"
          items={[
            {
              label: ANNUAL_REPORTS_MESSAGES.taxCalculationTab.taxBeforeCredits,
              value: data.tax_before_credits,
              tone: 'negative' as const,
            },
            { label: ANNUAL_REPORTS_MESSAGES.taxCalculationTab.taxCredits, value: totalCredits, tone: 'info' as const },
            {
              label: ANNUAL_REPORTS_MESSAGES.taxCalculationTab.finalTaxDue,
              value: data.tax_after_credits,
              tone: 'positive' as const,
            },
          ].map((item) => ({
            label: item.label,
            value: (
              <span className={cn('font-bold tabular-nums', semanticMonoToneClasses[item.tone])}>
                {formatCurrencyILS(item.value)}
              </span>
            ),
          }))}
        />
      </Card>

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
        <SectionCard title={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.incomeTaxSectionTitle}>
          <Row label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.taxableIncome} value={formatCurrencyILS(data.taxable_income)} />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.pensionDeduction}
            value={formatCurrencyILS(data.pension_deduction)}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.taxBeforeCredits}
            value={formatCurrencyILS(data.tax_before_credits)}
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.creditPointsValue}
            value={formatCurrencyILS(data.credit_points_value)}
            muted
          />
          {Number(data.donation_credit) > 0 && (
            <Row
              label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.donationCredit}
              value={formatCurrencyILS(data.donation_credit)}
              muted
            />
          )}
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.effectiveRate}
            value={formatPercent(data.effective_rate, { isRatio: true, fractionDigits: 2 })}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.taxDue}
            value={formatCurrencyILS(data.tax_after_credits)}
            className="text-positive-700 font-semibold"
          />
        </SectionCard>
        <SectionCard title={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.nationalInsuranceSectionTitle}>
          <Row label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.insuredIncome} value={formatCurrencyILS(data.net_profit)} />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.rateUpToCeiling}
            value={formatCurrencyILS(data.national_insurance.base_amount)}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.rateAboveCeiling}
            value={formatCurrencyILS(data.national_insurance.high_amount)}
            muted
          />
          <Row
            label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.totalNationalInsurance}
            value={formatCurrencyILS(data.national_insurance.total)}
            className="font-semibold"
          />
        </SectionCard>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-1 shadow-sm">
        <dl className="divide-y divide-gray-100">
          <Row label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.netProfit} value={formatCurrencyILS(data.net_profit)} />
          {totalLiability !== null && (
            <Row
              label={ANNUAL_REPORTS_MESSAGES.taxCalculationTab.totalLiability}
              value={formatCurrencyILS(totalLiability)}
              className={getLiabilityTone(totalLiability)}
            />
          )}
        </dl>
      </div>

      {panel.isAdvisor && data.total_liability != null && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={panel.saveTaxResult} isLoading={panel.isSavingTaxResult}>
            {ANNUAL_REPORTS_MESSAGES.taxCalculationTab.saveCalculation}
          </Button>
        </div>
      )}

      <TaxBracketsTable brackets={data.brackets} />
    </div>
  )
}

TaxCalculationTab.displayName = 'TaxCalculationTab'
