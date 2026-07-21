import { AlertTriangle, CheckCircle, Info, XCircle, Send } from 'lucide-react'
import { Button } from '../../../../components/ui/primitives/Button'
import { cn } from '../../../../utils/utils'
import type { AnnualReportFull } from '../../api'
import { getAlertBanners, type AlertIcon, type AlertVariant } from '../../utils/panelHelpers'

interface Props {
  report: AnnualReportFull
  advances?: { balance_type: 'due' | 'refund' | 'zero'; final_balance: number | string }
}

interface BannerItem {
  variant: AlertVariant
  icon: AlertIcon
  message: string
  cta?: { label: string; onClick: () => void }
}

const VARIANT_STYLES = {
  error: 'bg-negative-50 border-negative-200 text-negative-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-info-50 border-info-200 text-info-800',
  success: 'bg-positive-50 border-positive-200 text-positive-800',
}

const ICON_STYLES = {
  error: 'text-negative-500',
  warning: 'text-warning-500',
  info: 'text-info-500',
  success: 'text-positive-500',
}

const ICONS: Record<AlertIcon, React.ReactNode> = {
  alert: <AlertTriangle className="h-4 w-4" />,
  check: <CheckCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  x: <XCircle className="h-4 w-4" />,
}

const Banner: React.FC<BannerItem> = ({ variant, icon, message, cta }) => (
  <div className={cn('flex items-start justify-between gap-3 rounded-lg border px-4 py-3', VARIANT_STYLES[variant])}>
    <div className="flex items-start gap-2">
      <span className={cn('mt-0.5 shrink-0', ICON_STYLES[variant])}>{ICONS[icon]}</span>
      <p className="text-sm leading-snug">{message}</p>
    </div>
    {cta && (
      <Button variant="outline" size="xs" icon={<Send className="h-3 w-3" />} onClick={cta.onClick} className="shrink-0">
        {cta.label}
      </Button>
    )}
  </div>
)

export const ReportAlertBanners: React.FC<Props> = ({ report, advances }) => {
  const banners = getAlertBanners(report, advances)

  if (banners.length === 0) return null

  return (
    <div className="space-y-2">
      {banners.map((b) => (
        <Banner key={b.message} {...b} />
      ))}
    </div>
  )
}
