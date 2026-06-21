import { useEffect, useEffectEvent, useRef, type RefObject } from 'react'

interface UseClientSidebarFocusTrapParams {
  mobileOpen: boolean
  mobileTriggerRef: RefObject<HTMLButtonElement | null>
  onMobileClose: () => void
}

interface UseClientSidebarFocusTrapResult {
  sidebarRef: RefObject<HTMLElement | null>
  searchInputRef: RefObject<HTMLInputElement | null>
}

/**
 * Traps focus inside the mobile sidebar while it is open: locks body scroll,
 * focuses the search field on open, cycles Tab within the panel, closes on
 * Escape, and restores focus to the trigger on close. No-op on desktop.
 */
export const useClientSidebarFocusTrap = ({
  mobileOpen,
  mobileTriggerRef,
  onMobileClose,
}: UseClientSidebarFocusTrapParams): UseClientSidebarFocusTrapResult => {
  const sidebarRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const onMobileCloseEvent = useEffectEvent(onMobileClose)

  useEffect(() => {
    if (!mobileOpen) return

    const mobileTrigger = mobileTriggerRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const frame = requestAnimationFrame(() => searchInputRef.current?.focus())

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onMobileCloseEvent()
        return
      }

      if (event.key !== 'Tab' || !sidebarRef.current) return

      const focusable = Array.from(
        sidebarRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      mobileTrigger?.focus()
    }
  }, [mobileOpen, mobileTriggerRef])

  return { sidebarRef, searchInputRef }
}
