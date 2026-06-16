import { useState } from 'react'
import { PlusCircle, Calendar, SlidersHorizontal } from 'lucide-react'
import type { AdvancePaymentStatus } from '../api/contracts'
import { Select } from '../../../components/ui/inputs/Select'
import { ConfirmDialog } from '../../../components/ui/overlays/ConfirmDialog'
import { getAdvancePaymentStatusLabel } from '../constants'
import { getOperationalYearOptions } from '@/constants/periodOptions.constants'
import { ADVANCE_PAYMENT_STATUS_FILTERS } from '../constants'

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

const FREQUENCY_LABEL: Record<1 | 2, string> = {
  1: 'חודשי',
  2: 'דו-חודשי',
}

const STATUS_ACTIVE = 'bg-blue-600 text-white border-blue-600'
const STATUS_INACTIVE = 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'

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
            <button
              type="button"
              onClick={onOpenCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              הוסף מקדמה
            </button>
            <div className="h-8 w-px bg-gray-200 hidden sm:block" />
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {displayFrequency != null ? (
                  <>
                    תדירות מקדמות:{' '}
                    <span className="font-semibold text-gray-800">{FREQUENCY_LABEL[displayFrequency]}</span>
                  </>
                ) : (
                  <span className="text-gray-400">תדירות מקדמות לא הוגדרה</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => setConfirmGenerate(true)}
                disabled={isGenerating || generationFrequency == null}
                title={generationFrequency == null ? 'לא ניתן ליצור לוח בלי תדירות מקדמות בפרופיל הלקוח' : undefined}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calendar className="h-3.5 w-3.5" />
                {isGenerating ? 'יוצר...' : 'צור לוח שנתי'}
              </button>
            </div>
            {generationFrequency != null && (
              <ConfirmDialog
                open={confirmGenerate}
                title="יצירת לוח מקדמות"
                message={`ליצור מקדמות ${FREQUENCY_LABEL[generationFrequency]} לשנת ${year}? ייווצרו רק מקדמות שתאריך היעד שלהן מהיום והלאה. מקדמות קיימות לא יושפעו.`}
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-700">
            <SlidersHorizontal className="h-4 w-4 text-blue-600" />
            <span className="font-semibold text-sm">סינון</span>
          </div>
          {advanceRate != null && (
            <span className="text-sm text-gray-500">
              אחוז מקדמות: <span className="font-semibold text-gray-800">{advanceRate}%</span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex flex-wrap gap-1.5">
            {ADVANCE_PAYMENT_STATUS_FILTERS.map((status) => {
              const active = statusFilter.includes(status)
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onToggleStatus(status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    active ? STATUS_ACTIVE : STATUS_INACTIVE
                  }`}
                >
                  {getAdvancePaymentStatusLabel(status)}
                </button>
              )
            })}
          </div>
          <div className="mr-auto w-28">
            <Select
              value={String(year)}
              onChange={(e) => onYearChange(Number(e.target.value))}
              options={getOperationalYearOptions()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

ClientAdvancePaymentsHeader.displayName = 'ClientAdvancePaymentsHeader'
