import { useState } from 'react'
import { PlusCircle, Calendar } from 'lucide-react'
import type { AdvancePaymentStatus } from '../../api/contracts'
import { Select } from '@/components/ui/inputs/Select'
import { Button } from '@/components/ui/primitives/Button'
import { ConfirmDialog } from '@/components/ui/overlays/ConfirmDialog'
import { ToolbarContainer } from '@/components/ui/layout/ToolbarContainer'
import {
  getAdvancePaymentStatusLabel,
  ADVANCE_PAYMENT_STATUS_FILTERS,
  ADVANCE_PAYMENT_FREQUENCY_PREFIX,
  ADVANCE_PAYMENT_FREQUENCY_UNSET_TEXT,
} from '../../constants'
import { getOperationalYearOptions, getMonthsCoveredLabel } from '@/constants/periodOptions.constants'

interface ClientAdvancePaymentsHeaderProps {
  isAdvisor: boolean
  statusFilter: AdvancePaymentStatus[]
  onToggleStatus: (status: AdvancePaymentStatus) => void
  year: number
  onYearChange: (year: number) => void
  onOpenCreate: () => void
  onGenerateSchedule: () => void
  displayFrequency: 1 | 2 | null
  generationFrequency: 1 | 2 | null
  isGenerating?: boolean
  advanceRate?: number | null
}

export const ClientAdvancePaymentsHeader: React.FC<ClientAdvancePaymentsHeaderProps> = ({
  isAdvisor,
  statusFilter,
  onToggleStatus,
  year,
  onYearChange,
  onOpenCreate,
  onGenerateSchedule,
  displayFrequency,
  generationFrequency,
  isGenerating,
  advanceRate,
}) => {
  const [confirmGenerate, setConfirmGenerate] = useState(false)

  return (
    <div className="space-y-4">
      {/* Action row */}
      <div className="flex flex-wrap items-center gap-3">
        {isAdvisor && (
          <>
            <Button type="button" onClick={onOpenCreate}>
              <PlusCircle className="h-4 w-4" />
              הוסף מקדמה
            </Button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
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
      <ToolbarContainer>
        <div className="space-y-3">
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="block text-sm font-medium text-gray-700">סטטוס</span>
              <div className="flex flex-wrap gap-1.5">
                {ADVANCE_PAYMENT_STATUS_FILTERS.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={statusFilter.includes(status) ? 'primary' : 'outline'}
                    onClick={() => onToggleStatus(status)}
                  >
                    {getAdvancePaymentStatusLabel(status)}
                  </Button>
                ))}
              </div>
            </div>
            <Select
              label="שנה"
              value={String(year)}
              onChange={(e) => onYearChange(Number(e.target.value))}
              options={getOperationalYearOptions()}
              fieldClassName="sm:max-w-xs"
            />
          </div>
          {advanceRate != null && (
            <p className="text-sm text-gray-500">
              אחוז מקדמות: <span className="font-semibold text-gray-800">{advanceRate}%</span>
            </p>
          )}
        </div>
      </ToolbarContainer>
    </div>
  )
}
