import type { ComponentType } from 'react'
import {
  Building2,
  Briefcase,
  Car,
  GraduationCap,
  Landmark,
  Megaphone,
  MoreHorizontal,
  Plane,
  Shield,
  Smartphone,
  TrendingDown,
  Users,
} from 'lucide-react'

export const DEFAULT_CREDIT_POINT_VALUE = 2_904

export const CREDIT_POINT_VALUE_BY_YEAR: Record<number, number> = {
  2024: 2_904,
  2025: 3_003,
  2026: 3_003,
}

export const PENSION_DEDUCTION_RATE = 0.045

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
  other: MoreHorizontal,
}
