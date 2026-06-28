import { SectionHeader } from '../layout/SectionHeader'

interface DrawerSectionProps {
  title: string
  children: React.ReactNode
}

export const DrawerSection: React.FC<DrawerSectionProps> = ({ title, children }) => (
  <div>
    <SectionHeader title={title} size="xs" className="mb-2" />
    <div className="rounded-lg border border-gray-200 px-4 shadow-elevation-0">{children}</div>
  </div>
)
DrawerSection.displayName = 'DrawerSection'
