import type { ComponentType } from 'react'
import {
  Building2,
  Briefcase,
  Car,
  GraduationCap,
  Landmark,
  Megaphone,
  EllipsisVertical,
  Plane,
  Shield,
  Smartphone,
  TrendingDown,
  Users,
} from 'lucide-react'

export const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  office_rent: Building2,
  professional_services: Briefcase,
  salaries: Users,
  depreciation: TrendingDown,
  vehicle: Car,
  marketing: Megaphone,
  insurance: Shield,
  communication: Smartphone,
  travel: Plane,
  training: GraduationCap,
  bank_fees: Landmark,
  other: EllipsisVertical,
}
