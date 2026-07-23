import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/utils'
import { iconChipToneClasses, type IconChipTone } from '@/utils/semanticColors'

type IconChipSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface IconChipProps {
  icon: LucideIcon
  /** Semantic color recipe from semanticColors. Omit only for true one-offs colored via className. */
  tone?: IconChipTone
  /** Adds the tone-matched subtle ring. */
  ring?: boolean
  size?: IconChipSize
  /** Placement or exceptional styling only — colors come from `tone`. */
  className?: string
}

// xs is the dense list/menu chip and rounds tighter; the rest share rounded-2xl.
const sizeClasses: Record<IconChipSize, string> = {
  xs: 'h-7 w-7 rounded-lg',
  sm: 'h-9 w-9 rounded-2xl',
  md: 'h-10 w-10 rounded-2xl',
  lg: 'h-11 w-11 rounded-2xl',
  xl: 'h-12 w-12 rounded-2xl',
}

const iconSizeClasses: Record<IconChipSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-5 w-5',
  xl: 'h-5 w-5',
}

export const IconChip = ({ icon: Icon, tone, ring = false, size = 'md', className }: IconChipProps) => (
  <span
    className={cn(
      'flex shrink-0 items-center justify-center',
      sizeClasses[size],
      tone && iconChipToneClasses[tone].base,
      tone && ring && iconChipToneClasses[tone].ring,
      className,
    )}
  >
    <Icon className={iconSizeClasses[size]} />
  </span>
)

IconChip.displayName = 'IconChip'
