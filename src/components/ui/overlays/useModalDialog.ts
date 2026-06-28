import { useEffect, useRef, useState } from 'react'

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
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    setPortalHost(open ? portalHostRef.current : null)
  }, [open])

  return { dialogRef, portalHostRef, portalHost }
}
