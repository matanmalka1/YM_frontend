import {
  cloneElement,
  isValidElement,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../../utils/utils'

interface TooltipProps {
  text: string
  children: ReactNode
  className?: string
}

interface TooltipPosition {
  top: number
  left: number
}

type TooltipTriggerProps = React.HTMLAttributes<HTMLElement>

const VIEWPORT_GAP = 8
const TRIGGER_GAP = 8

export const Tooltip: React.FC<TooltipProps> = ({ text, children, className }) => {
  const tooltipId = useId()
  const triggerRef = useRef<HTMLElement | null>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<TooltipPosition | null>(null)
  const canUseDOM = typeof document !== 'undefined'

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current
    const tooltip = tooltipRef.current
    if (!trigger || !tooltip) return

    const triggerRect = trigger.getBoundingClientRect()
    const tooltipRect = tooltip.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const preferredTop = triggerRect.top - tooltipRect.height - TRIGGER_GAP
    const fallbackTop = triggerRect.bottom + TRIGGER_GAP
    const top =
      preferredTop >= VIEWPORT_GAP
        ? preferredTop
        : Math.min(fallbackTop, viewportHeight - tooltipRect.height - VIEWPORT_GAP)
    const centeredLeft = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
    const left = Math.min(Math.max(centeredLeft, VIEWPORT_GAP), viewportWidth - tooltipRect.width - VIEWPORT_GAP)

    setPosition({ top, left })
  }, [])

  const showTooltip = (event: React.PointerEvent<HTMLElement> | React.FocusEvent<HTMLElement>) => {
    triggerRef.current = event.currentTarget
    setOpen(true)
  }

  const hideTooltip = () => {
    setOpen(false)
  }

  useLayoutEffect(() => {
    if (!open) return

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open, updatePosition])

  const trigger = isValidElement<TooltipTriggerProps>(children) ? (
    cloneElement(children, {
      'aria-describedby': open ? tooltipId : undefined,
      className: cn(children.props.className, className),
      onBlur: (event) => {
        children.props.onBlur?.(event)
        hideTooltip()
      },
      onFocus: (event) => {
        children.props.onFocus?.(event)
        showTooltip(event)
      },
      onKeyDown: (event) => {
        children.props.onKeyDown?.(event)
        if (event.key === 'Escape') hideTooltip()
      },
      onPointerEnter: (event) => {
        children.props.onPointerEnter?.(event)
        showTooltip(event)
      },
      onPointerLeave: (event) => {
        children.props.onPointerLeave?.(event)
        hideTooltip()
      },
    })
  ) : (
    <span
      role="button"
      tabIndex={0}
      className={cn('inline-flex', className)}
      aria-describedby={open ? tooltipId : undefined}
      onPointerEnter={showTooltip}
      onPointerLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      onKeyDown={(event) => {
        if (event.key === 'Escape') hideTooltip()
      }}
    >
      {children}
    </span>
  )

  return (
    <>
      {trigger}
      {open && canUseDOM
        ? createPortal(
            <span
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              dir="rtl"
              style={
                position
                  ? {
                      top: position.top,
                      left: position.left,
                    }
                  : {
                      top: 0,
                      left: 0,
                    }
              }
              className={cn(
                'pointer-events-none fixed z-[10000] max-w-[calc(100vw-1rem)] whitespace-nowrap rounded-lg bg-gray-900 px-2.5 py-1.5 text-center text-xs font-medium text-white shadow-lg',
                position ? 'opacity-100' : 'opacity-0',
              )}
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </>
  )
}

Tooltip.displayName = 'Tooltip'
