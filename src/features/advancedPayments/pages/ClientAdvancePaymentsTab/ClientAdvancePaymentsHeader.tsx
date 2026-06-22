import { useState } from 'react'
import { PlusCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Divider } from '@/components/ui/primitives/Divider'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { FilterPanel } from '@/components/ui/filters/FilterPanel'
import type { FilterFieldDef } from '@/components/ui/filters/types'
import {
  getAdvancePaymentStatusLabel,
  ADVANCE_PAYMENT_STATUS_FILTERS,
  ADVANCE_PAYMENT_FREQUENCY_PREFIX,
  ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT,
} from '../../constants'
import {
  getOperationalYearOptions,
  getOperationalTaxYear,
  getMonthsCoveredLabel,
} from '@/constants/periodOptions.constants'

interface ClientAdvancePaymentsHeaderProps {
  isAdvisor: boolean
  year: number
  filterValues: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onFilterReset: () => void
  onOpenCreate: () => void
  onGenerateSchedule: () => void
  displayFrequency: 1 | 2 | null
  generationFrequency: 1 | 2 | null
  isGenerating?: boolean
  advanceRate?: number | null
}

export const ClientAdvancePaymentsHeader: React.FC<ClientAdvancePaymentsHeaderProps> = ({
  isAdvisor,
  year,
  filterValues,
  onFilterChange,
  onFilterReset,
  onOpenCreate,
  onGenerateSchedule,
  displayFrequency,
  generationFrequency,
  isGenerating,
  advanceRate,
}) => {
  const [confirmGenerate, setConfirmGenerate] = useState(false)

  const filterFields: FilterFieldDef[] = [
    {
      type: 'toggle',
      key: 'status_filter',
      label: 'סטטוס',
      options: ADVANCE_PAYMENT_STATUS_FILTERS.map((status) => ({
        value: status,
        label: getAdvancePaymentStatusLabel(status),
      })),
    },
    {
      type: 'select',
      key: 'year',
      label: 'שנה',
      options: getOperationalYearOptions(),
      defaultValue: String(getOperationalTaxYear()),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {isAdvisor && (
          <>
            <Button type="button" onClick={onOpenCreate}>
              <PlusCircle className="h-4 w-4" />
              הוסף מקדמה
            </Button>
            <Divider orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {displayFrequency != null ? (
                  <>
                    {ADVANCE_PAYMENT_FREQUENCY_PREFIX}{' '}
                    <span className="font-semibold text-gray-800">{getMonthsCoveredLabel(displayFrequency)}</span>
                  </>
                ) : (
                  <span className="text-gray-400">{ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT}</span>
                )}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmGenerate(true)}
                disabled={generationFrequency == null}
                isLoading={isGenerating}
                loadingLabel="יוצר..."
                tooltip={generationFrequency == null ? 'לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח' : undefined}
                className="rounded-lg text-gray-700 hover:bg-white hover:shadow-sm"
              >
                <Calendar className="h-3.5 w-3.5" />
                צור לוח שנתי
              </Button>
            </div>
            {generationFrequency != null && (
              <ConfirmDialog
                open={confirmGenerate}
                title="יצירת לוח מקדמות"
                message={`ליצור מקדמות ${getMonthsCoveredLabel(generationFrequency)} לשנת ${year}? ייווצרו רק מקדמות שתאריך היעד שלהן מהיום והלאה. מקדמות קיימות לא יושפעו.`}
                confirmLabel="צור"
                cancelLabel="ביטול"
                onConfirm={() => {
                  setConfirmGenerate(false)
                  onGenerateSchedule()
                }}
                onCancel={() => setConfirmGenerate(false)}
              />
            )}
          </>
        )}
      </div>

      {/* Filter bar */}
      <FilterPanel
        fields={filterFields}
        values={filterValues}
        onChange={onFilterChange}
        onReset={onFilterReset}
        gridClass="grid-cols-1 sm:grid-cols-2"
      />
      {advanceRate != null && (
        <p className="text-sm text-gray-500">
          אחוז מקדמות: <span className="font-semibold text-gray-800">{advanceRate}%</span>
        </p>
      )}
    </div>
  )
}
