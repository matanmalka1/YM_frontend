import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/primitives/Button'
import { Divider } from '@/components/ui/primitives/Divider'
import { Select } from '@/components/ui/inputs/Select'
import { VatExportButtons } from '../shared/VatExportButtons'

interface VatClientActionBarProps {
  clientId: number
  isAdvisor: boolean
  selectedYear: number
  yearOptions: Array<{ value: string; label: string }>
  onCreateClick: () => void
  onYearChange: (year: number) => void
}

export const VatClientActionBar = ({
  clientId,
  isAdvisor,
  selectedYear,
  yearOptions,
  onCreateClick,
  onYearChange,
}: VatClientActionBarProps) => (
  <section>
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex md:order-2">
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={onCreateClick}
          size="sm"
          variant="ghost"
          className="w-full justify-center sm:w-auto"
        >
          פתיחת דוח מע״מ
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:order-1">
        {isAdvisor && (
          <div className="flex justify-start">
            <VatExportButtons clientId={clientId} year={selectedYear} />
          </div>
        )}
        <Divider orientation="vertical" className="hidden h-9 bg-gray-100 sm:block" />
        <Select
          value={String(selectedYear)}
          onChange={(e) => onYearChange(Number(e.target.value))}
          options={yearOptions}
          className="w-full py-1.5 sm:w-28"
        />
      </div>
    </div>
  </section>
)

VatClientActionBar.displayName = 'VatClientActionBar'
