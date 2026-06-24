import { Card } from '@/components/ui/primitives/Card'

type AuditTrailHeaderCardProps = {
  title: string
  subtitle: string
  className?: string
}

export const AuditTrailHeaderCard: React.FC<AuditTrailHeaderCardProps> = ({ title, subtitle, className }) => (
  <Card title={title} subtitle={subtitle} className={className} />
)

AuditTrailHeaderCard.displayName = 'AuditTrailHeaderCard'
