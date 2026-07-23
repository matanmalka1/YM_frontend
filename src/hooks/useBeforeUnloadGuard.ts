import { useEffect } from 'react'

/**
 * Warns before the browser unloads (refresh / tab close) while a form holds
 * unsaved changes. Full-page forms only — modal/drawer close guarding is
 * `components/ui/overlays/useUnsavedChangesGuard`.
 *
 * In-app navigation is NOT blocked: the app mounts a declarative
 * `<BrowserRouter>`, and `useBlocker` requires a data router
 * (`createBrowserRouter`). Full in-app blocking is deferred to a router
 * migration — do not try to intercept link clicks here.
 */
export const useBeforeUnloadGuard = (isDirty: boolean) => {
  useEffect(() => {
    if (!isDirty) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])
}
