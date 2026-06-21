import { SectionHeader } from '../layout/SectionHeader'

interface DrawerFieldProps {
  label: string
  value: React.ReactNode
}

export const DrawerField: React.FC<DrawerFieldProps> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500 shrink-0">{label}</span>
    <span className="text-sm text-gray-900 text-start font-medium">{value ?? '—'}</span>
  </div>
)
DrawerField.displayName = 'DrawerField'

interface DrawerSectionProps {
  title: string
  children: React.ReactNode
}

export const DrawerSection: React.FC<DrawerSectionProps> = ({ title, children }) => (
  <div>
    <SectionHeader title={title} size="xs" className="mb-2" />
    <div className="rounded-lg border border-gray-200 px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">{children}</div>
  </div>
)
DrawerSection.displayName = 'DrawerSection'
