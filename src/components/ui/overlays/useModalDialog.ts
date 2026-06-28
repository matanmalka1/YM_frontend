import { useEffect, useRef, useState } from 'react'

/**
 * Module-level body scroll-lock that is shared across every open dialog. Naive
 * per-dialog save/restore breaks when overlays nest: a second dialog captures
 * the already-locked `overflow: hidden` as its "previous" value, so closing it
 * leaves the body locked. We instead reference-count the locks and only restore
 * the original style once the last dialog releases.
 */
let scrollLockCount = 0
let restoreOverflow = ''

const lockBodyScroll = () => {
  if (scrollLockCount === 0) {
    restoreOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount += 1
}

const unlockBodyScroll = () => {
  scrollLockCount = Math.max(0, scrollLockCount - 1)
  if (scrollLockCount === 0) {
    document.body.style.overflow = restoreOverflow
  }
}

/**
 * Drives a native modal <dialog>: opens it with showModal() (browser focus trap,
 * Escape, ::backdrop), locks body scroll while open, and exposes a portal host
 * for overlays rendered inside the dialog. `open` stays the single source of
 * truth — the dialog unmounts when the parent flips it to false.
 */
export const useModalDialog = (open: boolean) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const portalHostRef = useRef<HTMLDivElement>(null)
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return

    if (!dialog.open) dialog.showModal()
    lockBodyScroll()

    return () => {
      unlockBodyScroll()
    }
  }, [open])

  useEffect(() => {
    setPortalHost(open ? portalHostRef.current : null)
  }, [open])

  return { dialogRef, portalHostRef, portalHost }
}
