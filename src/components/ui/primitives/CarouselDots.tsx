import { cn } from '@/utils/utils'

interface CarouselDotItem {
  key: string
  label: string
}

interface CarouselDotsProps {
  items: readonly CarouselDotItem[]
  activeIndex: number
  onSelect: (index: number) => void
}

export const CarouselDots: React.FC<CarouselDotsProps> = ({ items, activeIndex, onSelect }) => (
  <div className="flex items-center gap-1 px-1">
    {items.map((item, index) => (
      <button
        key={item.key}
        type="button"
        onClick={() => onSelect(index)}
        aria-label={item.label}
        aria-current={index === activeIndex ? 'true' : undefined}
        className={cn(
          'focus-ring rounded-full transition-all duration-200',
          index === activeIndex ? 'h-1.5 w-4 bg-primary-500' : 'h-1.5 w-1.5 bg-slate-200 hover:bg-slate-300',
        )}
      />
    ))}
  </div>
)

