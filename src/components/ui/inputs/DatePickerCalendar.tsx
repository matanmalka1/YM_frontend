import { DayPicker, type Matcher } from 'react-day-picker'
import { setMonth, setYear, getMonth, getYear, addMonths, subMonths } from 'date-fns'
import { he } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, MONTH_NAMES } from '../../../utils/utils'
import { DatePickerInlineSelect } from './DatePickerInlineSelect'
import 'react-day-picker/style.css'

const START_YEAR = 2000
const END_YEAR = 2099

interface DatePickerCalendarProps {
  selected: Date | undefined
  month: Date
  onMonthChange: (month: Date) => void
  onSelect: (day: Date | undefined) => void
  maxDate?: Date
  minDate?: Date
  containerRef?: React.RefObject<HTMLDivElement | null>
  className?: string
  style?: React.CSSProperties
}

export const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  selected,
  month,
  onMonthChange,
  onSelect,
  maxDate,
  minDate,
  containerRef,
  className,
  style,
}) => {
  const disabledDays: Matcher[] = [...(maxDate ? [{ after: maxDate }] : []), ...(minDate ? [{ before: minDate }] : [])]
  const monthOptions = MONTH_NAMES.map((label, i) => ({ label, value: i }))
  const yearOptions = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => ({
    label: String(START_YEAR + i),
    value: START_YEAR + i,
  }))

  return (
    <div
      ref={containerRef}
      className={cn('rounded-xl border border-gray-200 bg-white shadow-lg', className)}
      style={style}
    >
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => onMonthChange(subMonths(month, 1))}
            className="p-1.5 rounded-lg hover:bg-primary-50 hover:text-primary-600 text-gray-400 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            <DatePickerInlineSelect
              value={getMonth(month)}
              options={monthOptions}
              onChange={(m) => onMonthChange(setMonth(month, m))}
            />
            <DatePickerInlineSelect
              value={getYear(month)}
              options={yearOptions}
              onChange={(y) => onMonthChange(setYear(month, y))}
            />
          </div>
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="p-1.5 rounded-lg hover:bg-primary-50 hover:text-primary-600 text-gray-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={onSelect}
          month={month}
          onMonthChange={onMonthChange}
          disabled={disabledDays.length ? disabledDays : undefined}
          locale={he}
          dir="rtl"
          hideNavigation
          classNames={{
            root: '',
            month_caption: 'hidden',
            weeks: 'border-collapse',
            weekdays: 'flex',
            weekday: 'w-9 text-center text-xs text-gray-400 font-normal pb-1',
            week: 'flex',
            day: 'w-9 h-9 text-center text-sm',
            day_button: cn(
              'w-9 h-9 rounded-lg text-sm font-normal transition-colors',
              'hover:bg-primary-50 hover:text-primary-700',
            ),
            selected: '[&>button]:bg-primary-600 [&>button]:text-white [&>button]:hover:bg-primary-700',
            today: '[&>button]:font-semibold [&>button]:text-primary-600',
            outside: 'opacity-30',
            disabled: 'opacity-30 cursor-not-allowed',
          }}
        />
      </div>
    </div>
  )
}

DatePickerCalendar.displayName = 'DatePickerCalendar'
